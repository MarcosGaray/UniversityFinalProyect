from pydantic import BaseModel, Field, field_validator

class CanchaSinId(BaseModel):
    nombre: str = Field(..., description="Nombre de la cancha", example="Cancha 1",max_length=255)
    techada: bool = Field(..., description="Indica si la cancha está techada", example=True)

    @field_validator('nombre')
    def check_empty_string1(cls, value):
        if value == "":
            raise ValueError("El nombre de cancha no puede estar vacío")
        return value

    class Config:
        #orm_mode = True
        from_attributes = True
        
class Cancha(CanchaSinId):
    id: int