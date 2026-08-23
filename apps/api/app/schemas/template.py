from pydantic import BaseModel


class TemplateOut(BaseModel):
    id: str
    name: str
    description: str
