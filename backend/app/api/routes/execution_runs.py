from fastapi import APIRouter
router = APIRouter()

@router.get("/run/{run_id}")
def get_execution_run(run_id: str):
    return {"run_id": run_id, "status": "succeeded", "logs": [], "artifacts": []}
