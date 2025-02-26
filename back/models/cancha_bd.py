from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from bd import Base

class CanchaBd(Base):
    __tablename__ = "canchas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    techada = Column(Boolean, nullable=False)
    # Relación inversa con Reserva
  #  reservas = relationship('ReservaBd', back_populates='cancha')