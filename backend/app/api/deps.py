from sqlalchemy.orm import Session
from app.core.container import get_container


def get_db():
    container = get_container()
    db: Session = container.session_factory()
    try:
        yield db
    finally:
        db.close()
