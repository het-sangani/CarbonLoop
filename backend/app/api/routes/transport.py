import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.auth import AuthenticatedUser, UserRole
from app.schemas.transport import (
    TransportJobCreate,
    TransportJobAssign,
    TransportJobStatusUpdate,
    TransportJobResponse,
    TransportJobStatus,
)
from app.services.transport_service import (
    TransportService,
    TransportJobNotFoundError,
    InvalidTransportJobStateError,
    UnauthorizedTransportActionError,
    InvalidTransportTransitionError,
)
from app.api.deps import (
    get_transport_service,
    get_current_user,
    require_transporter,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/jobs",
    response_model=TransportJobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a transport job from an accepted request",
)
def create_transport_job(
    job_in: TransportJobCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: TransportService = Depends(get_transport_service),
) -> TransportJobResponse:
    """
    Creates a new transport job from an ACCEPTED supply request.
    Automatically populates pickup and delivery locations, calculates road distance,
    and estimates cryogenic transport freight cost.
    """
    try:
        created = service.create_transport_job(job_in=job_in, creator_id=current_user.id)
        return TransportJobResponse(**created)
    except TransportJobNotFoundError as rnf_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(rnf_err),
        )
    except InvalidTransportJobStateError as state_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(state_err),
        )
    except Exception as exc:
        logger.exception("Failed to create transport job: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transport job: {str(exc)}",
        )


@router.get(
    "/jobs",
    response_model=List[TransportJobResponse],
    status_code=status.HTTP_200_OK,
    summary="List transport jobs scoped by role",
)
def list_transport_jobs(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (PENDING, ASSIGNED, IN_TRANSIT, DELIVERED)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: TransportService = Depends(get_transport_service),
) -> List[TransportJobResponse]:
    """
    Retrieves transport jobs scoped by authenticated user role.
    - TRANSPORTER: lists jobs assigned to this carrier or available (unassigned).
    - GOVERNMENT_AGENT: lists all jobs.
    - BUYER / SELLER: lists platform transport jobs.
    """
    try:
        if current_user.role == UserRole.TRANSPORTER:
            # Transporters see their assigned jobs
            jobs = service.get_transport_jobs(transporter_id=current_user.id, status=status_filter)
        else:
            jobs = service.get_transport_jobs(status=status_filter)
        return [TransportJobResponse(**j) for j in jobs]
    except Exception as exc:
        logger.exception("Failed to list transport jobs: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve transport jobs: {str(exc)}",
        )


@router.get(
    "/jobs/{job_id}",
    response_model=TransportJobResponse,
    status_code=status.HTTP_200_OK,
    summary="Get transport job by ID",
)
def get_transport_job(
    job_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    service: TransportService = Depends(get_transport_service),
) -> TransportJobResponse:
    """
    Retrieves a single transport job by ID.
    Enforces privacy: if another transporter tries to view a job assigned to someone else, 403 Forbidden is returned.
    """
    try:
        job = service.get_transport_job_by_id(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transport job with ID '{job_id}' not found",
            )

        assigned_id = str(job.get("transporter_id") or "")
        # If user is a transporter, they can only view unassigned jobs or jobs assigned to them
        if current_user.role == UserRole.TRANSPORTER:
            if assigned_id and assigned_id != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view transport jobs assigned to another carrier",
                )

        return TransportJobResponse(**job)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch transport job %s: %s", job_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve transport job: {str(exc)}",
        )


@router.patch(
    "/jobs/{job_id}/assign",
    response_model=TransportJobResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign transporter to transport job",
)
def assign_transporter(
    job_id: str,
    assign_in: Optional[TransportJobAssign] = None,
    current_user: AuthenticatedUser = Depends(require_transporter),
    service: TransportService = Depends(get_transport_service),
) -> TransportJobResponse:
    """
    Assigns an authenticated transporter to a transport job.
    Requires role TRANSPORTER.
    """
    effective_transporter_id = (
        assign_in.transporter_id if (assign_in and assign_in.transporter_id) else current_user.id
    )
    # Ensure a transporter cannot assign another user's ID
    if effective_transporter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot assign transport job to a different carrier",
        )

    try:
        updated = service.assign_transporter(job_id, effective_transporter_id)
        return TransportJobResponse(**updated)
    except TransportJobNotFoundError as rnf_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(rnf_err),
        )
    except InvalidTransportJobStateError as state_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(state_err),
        )
    except Exception as exc:
        logger.exception("Failed to assign transporter for job %s: %s", job_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign transporter: {str(exc)}",
        )


@router.patch(
    "/jobs/{job_id}/status",
    response_model=TransportJobResponse,
    status_code=status.HTTP_200_OK,
    summary="Update transport job delivery status along lifecycle",
)
def update_job_status(
    job_id: str,
    status_in: TransportJobStatusUpdate,
    current_user: AuthenticatedUser = Depends(require_transporter),
    service: TransportService = Depends(get_transport_service),
) -> TransportJobResponse:
    """
    Updates the status of a transport job along its lifecycle:
    PENDING -> ASSIGNED -> IN_TRANSIT -> DELIVERED.
    
    Security & Business Rules:
    1. Requires role TRANSPORTER.
    2. Caller must be the assigned carrier for this job.
    3. Status transitions must follow valid sequential forward lifecycle.
    4. Terminal DELIVERED state cannot transition backwards.
    """
    try:
        updated = service.update_job_status(
            job_id=job_id,
            new_status=status_in.status,
            transporter_id=current_user.id,
        )
        return TransportJobResponse(**updated)
    except TransportJobNotFoundError as rnf_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(rnf_err),
        )
    except UnauthorizedTransportActionError as ura_err:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(ura_err),
        )
    except InvalidTransportTransitionError as trans_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(trans_err),
        )
    except Exception as exc:
        logger.exception("Failed to update transport job status %s: %s", job_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update transport job status: {str(exc)}",
        )
