from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.auth import AuthenticatedUser
from app.schemas.match import MatchItemResponse, MatchListResponse
from app.schemas.listing import ListingResponse
from app.services.matching import MatchingService
from app.services.requirement_service import RequirementService
from app.api.deps import (
    get_matching_service,
    get_requirement_service,
    require_buyer,
)

router = APIRouter()


@router.get(
    "/{requirement_id}",
    response_model=MatchListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get ranked matchmaking results for a buyer requirement",
)
def get_matches_for_requirement(
    requirement_id: str,
    current_user: AuthenticatedUser = Depends(require_buyer),
    matching_service: MatchingService = Depends(get_matching_service),
    requirement_service: RequirementService = Depends(get_requirement_service),
) -> MatchListResponse:
    """
    Retrieve ranked CO2 supply matches for a specific buyer requirement.
    
    Security & Ownership:
    - Requires BUYER role.
    - Enforces that only the owner/creator of the requirement can view its matches.
    - Returns 404 if the requirement is not found.
    - Returns 403 if the requirement belongs to another buyer.
    
    Scoring Architecture:
    - Chemical Assay & Purity Fit: 40%
    - Logistical Distance & Transit Modality: 30%
    - Volume Off-Take & Capacity Fit: 30%
    - Availability & Price compatibility weighting
    """
    # 1. Fetch requirement and verify existence
    req = requirement_service.get_requirement_by_id(requirement_id)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requirement with ID '{requirement_id}' not found",
        )

    # 2. Ownership check
    if req.get("buyer_id") and str(req["buyer_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view matches for another buyer's requirement",
        )

    # 3. Compute ranked matches
    try:
        raw_matches = matching_service.find_matches(requirement_id, persist=True)

        items: List[MatchItemResponse] = []
        for m in raw_matches:
            listing_data = m["listing"]
            items.append(
                MatchItemResponse(
                    id=m.get("id"),
                    listing_id=m["listing_id"],
                    requirement_id=requirement_id,
                    listing=ListingResponse(**listing_data),
                    match_score=m["match_score"],
                    purity_score=m["purity_score"],
                    quantity_score=m["quantity_score"],
                    location_score=m["location_score"],
                    availability_score=m["availability_score"],
                    price_score=m["price_score"],
                    distance_km=m.get("distance_km"),
                    explanation=m["explanation"],
                    created_at=m.get("created_at"),
                )
            )

        return MatchListResponse(
            requirement_id=requirement_id,
            total_matches=len(items),
            matches=items,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matchmaking engine failed: {str(exc)}",
        )
