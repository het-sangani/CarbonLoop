from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
    RequirementResponse,
)
from app.schemas.auth import AuthenticatedUser
from app.services.requirement_service import RequirementService
from app.api.deps import get_requirement_service, require_buyer

router = APIRouter()


@router.post(
    "",
    response_model=RequirementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new buyer requirement",
)
def create_requirement(
    requirement_in: RequirementCreate,
    current_user: AuthenticatedUser = Depends(require_buyer),
    service: RequirementService = Depends(get_requirement_service),
) -> RequirementResponse:
    """
    Create a new buyer requirement for CO2 supply.
    Requires BUYER role. The buyer_id is automatically bound to the authenticated user ID.
    """
    try:
        created = service.create_requirement(requirement_in, buyer_id=current_user.id)
        return RequirementResponse(**created)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create requirement: {str(exc)}",
        )


@router.get(
    "",
    response_model=List[RequirementResponse],
    status_code=status.HTTP_200_OK,
    summary="List all buyer requirements",
)
def get_requirements(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by requirement status"),
    min_purity: Optional[float] = Query(None, ge=0, le=100, description="Filter by minimum purity %"),
    buyer_id: Optional[str] = Query(None, description="Filter by buyer identifier"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of requirements to return"),
    offset: int = Query(0, ge=0, description="Number of requirements to skip"),
    service: RequirementService = Depends(get_requirement_service),
) -> List[RequirementResponse]:
    """
    Retrieve all buyer requirements with optional filtering and pagination.
    Marketplace explorer endpoint accessible to all users.
    """
    try:
        records = service.get_requirements(
            status=status_filter,
            min_purity=min_purity,
            buyer_id=buyer_id,
            limit=limit,
            offset=offset,
        )
        return [RequirementResponse(**item) for item in records]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve requirements: {str(exc)}",
        )


@router.get(
    "/{requirement_id}",
    response_model=RequirementResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific buyer requirement by ID",
)
def get_requirement_by_id(
    requirement_id: str,
    service: RequirementService = Depends(get_requirement_service),
) -> RequirementResponse:
    """
    Retrieve details for a specific buyer requirement by ID.
    """
    try:
        record = service.get_requirement_by_id(requirement_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Requirement with ID '{requirement_id}' not found",
            )
        return RequirementResponse(**record)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve requirement: {str(exc)}",
        )


@router.patch(
    "/{requirement_id}",
    response_model=RequirementResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing buyer requirement",
)
def update_requirement(
    requirement_id: str,
    requirement_update: RequirementUpdate,
    current_user: AuthenticatedUser = Depends(require_buyer),
    service: RequirementService = Depends(get_requirement_service),
) -> RequirementResponse:
    """
    Partially update fields on an existing buyer requirement.
    Requires BUYER role. Enforces that only the creator/owner buyer can modify their requirement.
    """
    try:
        existing = service.get_requirement_by_id(requirement_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Requirement with ID '{requirement_id}' not found",
            )

        # Ownership check: buyer cannot modify another buyer's requirement
        if existing.get("buyer_id") and str(existing["buyer_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify another buyer's requirement",
            )

        updated = service.update_requirement(requirement_id, requirement_update)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Requirement with ID '{requirement_id}' not found",
            )
        return RequirementResponse(**updated)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update requirement: {str(exc)}",
        )


@router.delete(
    "/{requirement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a buyer requirement",
)
def delete_requirement(
    requirement_id: str,
    current_user: AuthenticatedUser = Depends(require_buyer),
    service: RequirementService = Depends(get_requirement_service),
):
    """
    Delete an existing buyer requirement by ID.
    Requires BUYER role. Enforces that only the creator/owner buyer can delete their requirement.
    """
    try:
        existing = service.get_requirement_by_id(requirement_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Requirement with ID '{requirement_id}' not found",
            )

        # Ownership check: buyer cannot delete another buyer's requirement
        if existing.get("buyer_id") and str(existing["buyer_id"]) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete another buyer's requirement",
            )

        deleted = service.delete_requirement(requirement_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Requirement with ID '{requirement_id}' not found",
            )
        return None
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete requirement: {str(exc)}",
        )
