from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Time
from sqlalchemy.orm import relationship
from bd import Base

class ReservaBd(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dia = Column(DateTime, nullable=False)
    horario = Column(Time, nullable=False)
    horarioFinal = Column(Time, nullable=True)
    duracion = Column(Integer, nullable=False)
    idCancha = Column(Integer, ForeignKey('canchas.id'), nullable=False)
    nombreContacto = Column(String(255), nullable=False)
    telefonoContacto = Column(String(50), nullable=False)
    cancha = relationship('CanchaBd')