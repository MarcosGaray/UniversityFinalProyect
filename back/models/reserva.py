import datetime
import time
from datetime import datetime, time, timedelta
from typing import Optional
from pydantic import BaseModel, Field, ValidationInfo, field_validator, root_validator
from models.cancha import Cancha

class ReservaSinId(BaseModel):
    dia: datetime = Field(..., description="Fecha y hora de la reserva", example="2024-12-16T00:00:00")
    horario: time = Field(..., description="Hora de inicio de la reserva", example="15:00:00")
    horarioFinal: Optional[time] = Field(None,description="Hora en que finaliza la reserva", example="17:00:00")
    duracion: int = Field(..., description="Duración de la reserva en minutos", example=90)
    idCancha: int = Field(..., description="ID de la cancha asociada", example=1)
    cancha: Cancha = Field(..., description="Información de la cancha reservada")
    nombreContacto: str = Field(..., description="Nombre de la persona que realiza la reserva", example="Juan Pérez", max_length=255)
    telefonoContacto: str = Field(..., description="Número de teléfono del contacto", example="3434776345",min_length=9,max_length=13)

    # Validador para campos específicos
    
    @field_validator('duracion')
    def check_duracion(cls, value, info: ValidationInfo):
        duracion = value
        horario_inicial = info.data["horario"] if "horario" in info.data else None
        horarioFinal = info.data["horarioFinal"] if "horarioFinal" in info.data else None
        
        if duracion < 0:
            raise ValueError("La duración no puede ser negativa")
        #import pdb; pdb.set_trace()
        if horario_inicial:
            horario_inicial_date = datetime.combine(datetime.today(), horario_inicial)
            
            if not horarioFinal:
                horario_final_date = horario_inicial_date + timedelta(minutes=duracion)
                horarioFinal = horario_final_date.time()
                info.data["horarioFinal"] = horarioFinal
            
            # Ahora, verificamos si el horario final calculado coincide con el proporcionado
            horario_final_esperado = horario_inicial_date + timedelta(minutes=duracion)
            horario_final_esperado_time = horario_final_esperado.time()

            if horarioFinal != horario_final_esperado_time:
                raise ValueError(
                    f"La duración de {duracion} minutos no coincide con el horario final esperado. "
                    f"Horario inicial: {horario_inicial}. Horario final esperado: {horario_final_esperado_time}. "
                    f"Horario final ingresado: {horarioFinal}"
                )

        return value
    
    @field_validator('idCancha')
    def check_id_cancha(cls, value):
        if value <= -1:
            raise ValueError("Debe indicar una id de cancha válido")
        return value
    
    @field_validator('nombreContacto')
    def check_empty_string1(cls, value):
        if value == "":
            raise ValueError("El nombre de contacto no puede estar vacío")
        return value
    
    @field_validator('telefonoContacto')
    def check_empty_string2(cls, value):
        if value == "":
            raise ValueError("El teléfono de contacto no puede estar vacío")
        if not value.isdigit():
            raise ValueError("El teléfono de contacto debe contener solo números")
        return value
    
    #Descomentar en caso de que quiera impedir reservas pasadas
    '''
    @field_validator('dia')
    def check_fecha_futura(cls, value):
        if value.date() < datetime.now().date():
            raise ValueError("El día de la reserva no puede ser en el pasado")
        return value    
    '''
    class Config:
        #orm_mode = True
        from_attributes = True
        arbitrary_types_allowed=True

class Reserva(ReservaSinId):
    id: int 

    
 