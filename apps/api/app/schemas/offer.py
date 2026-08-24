from pydantic import BaseModel


class OfferIn(BaseModel):
    title: str
    description: str = ""
