import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.auth import AuthenticatedUser, UserRole
from app.schemas.request import (
    RequestCreate,
    RequestStatusUpdate,
    RequestResponse,
    RequestStatus,
)
from app.services.request_service import (
    RequestService,
    RequestNotFoundError,
    MatchNotFoundError,
    UnauthorizedRequestActionError,
    InvalidRequestDataError,
)
from app.api.deps import (
    get_request_service,
    get_current_user,
    require_buyer,
    require_seller,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new supply request from a matched listing",
)
def create_request(
    request_in: RequestCreate,
    current_user: AuthenticatedUser = Depends(require_buyer),
    service: RequestService = Depends(get_request_service),
) -> RequestResponse:
    """
    Creates a new CO2 supply request/bid for a matched listing.
    
    Security & Business Rules:
    1. Only authenticated BUYER can create a request.
    2. The buyer must own the requirement associated with the match.
    3. The seller is strictly resolved from the matched listing.
    4. Match ID must be valid and exist in the system.
    5. Quantity must be > 0.
    6. Offered price must be >= 0.
    """
    try:
        created = service.create_request(request_in=request_in, buyer_id=current_user.id)
        return RequestResponse(**created)
    except MatchNotFoundError as mnf_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(mnf_err),
        )
    except UnauthorizedRequestActionError as ura_err:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(ura_err),
        )
    except InvalidRequestDataError as inv_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(inv_err),
        )
    except Exception as exc:
        logger.exception("Failed to create supply request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create request: {str(exc)}",
        )


@router.get(
    "",
    response_model=List[RequestResponse],
    status_code=status.HTTP_200_OK,
    summary="List supply requests scoped to current user",
)
def list_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (PENDING, ACCEPTED, REJECTED)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: RequestService = Depends(get_request_service),
) -> List[RequestResponse]:
    """
    List supply requests automatically scoped to the authenticated user's role:
    - BUYER: sees only requests initiated by them (`buyer_id == current_user.id`).
    - SELLER: sees only incoming requests directed to them (`seller_id == current_user.id`).
    - GOVERNMENT_AGENT: can audit all marketplace requests.
    - Other roles: forbidden.
    """
    try:
        if current_user.role == UserRole.BUYER:
            requests = service.get_requests(buyer_id=current_user.id, status=status_filter)
        elif current_user.role == UserRole.SELLER:
            requests = service.get_requests(seller_id=current_user.id, status=status_filter)
        elif current_user.role == UserRole.GOVERNMENT_AGENT:
            requests = service.get_requests(status=status_filter)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.value}' is not permitted to view supply requests",
            )
        return [RequestResponse(**r) for r in requests]
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to list requests: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve requests: {str(exc)}",
        )


@router.get(
    "/{request_id}",
    response_model=RequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific supply request by ID",
)
def get_request(
    request_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: RequestService = Depends(get_request_service),
) -> RequestResponse:
    """
    Retrieve details of a single supply request.
    Enforces that only the initiating buyer, the recipient seller, or a government agent can view it.
    """
    try:
        req = service.get_request_by_id(request_id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Supply request with ID '{request_id}' not found",
            )

        # Scrutinize access rights
        is_owner_buyer = (str(req.get("buyer_id") or "") == str(current_user.id))
        is_owner_seller = (str(req.get("seller_id") or "") == str(current_user.id))
        is_gov = (current_user.role == UserRole.GOVERNMENT_AGENT)

        if not (is_owner_buyer or is_owner_seller or is_gov):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this supply request",
            )

        return RequestResponse(**req)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch request %s: %s", request_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve request: {str(exc)}",
        )


@router.patch(
    "/{request_id}/status",
    response_model=RequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept or reject a supply request (Seller only)",
)
def update_request_status(
    request_id: str,
    status_in: RequestStatusUpdate,
    current_user: AuthenticatedUser = Depends(require_seller),
    service: RequestService = Depends(get_request_service),
) -> RequestResponse:
    """
    Allows a seller to ACCEPT or REJECT an incoming supply request directed to them.
    
    Security & Authorization:
    1. Requires authenticated user with role SELLER.
    2. Only the seller designated in the request (`seller_id == current_user.id`) can perform this.
    3. Target status must be either ACCEPTED or REJECTED.
    """
    try:
        updated = service.update_request_status(
            request_id=request_id,
            new_status=status_in.status,
            seller_id=current_user.id,
        )
        return RequestResponse(**updated)
    except RequestNotFoundError as rnf_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(rnf_err),
        )
    except UnauthorizedRequestActionError as ura_err:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(ura_err),
        )
    except Exception as exc:
        logger.exception("Failed to update status for request %s: %s", request_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update request status: {str(exc)}",
        )
