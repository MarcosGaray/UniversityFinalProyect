from datetime import datetime, timedelta,time
from typing import Optional
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session
from models.reserva import Reserva,ReservaSinId
from models.reserva_bd import ReservaBd
from models.cancha_bd import CanchaBd
from repositorios.cancha_repo import CanchasRepository
from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError



class ReservasRepository:
    
    def get_all(self, db: Session):
        try:
            return db.query(ReservaBd).all()
        except Exception as e:
            self.handle_exception(e)

    def get_by_id(self, db: Session, id: int):
        try:
            reserva = db.query(ReservaBd).filter(ReservaBd.id == id).first()
            if not reserva:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,  detail="Reserva inexistente"
                )
            return reserva
        except Exception as e:
            self.handle_exception(e)

    def agregar(self, db: Session, datos: ReservaSinId):
        #import pdb; pdb.set_trace()
        try:    
            cancha = CanchasRepository().get_by_id(db, datos.idCancha)
            if not cancha:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Cancha no encontrada"
                )

            dia = datos.dia
            horario_inicio = datos.horario
            horario_fin = datos.horarioFinal
            duracion = datos.duracion
            
            def time_to_minutes(t: time):
                return t.hour * 60 + t.minute

            horario_inicio_minutos = time_to_minutes(horario_inicio)
            horario_fin_minutos = time_to_minutes(horario_fin)

            # Validar que los horarios estén en el rango de un día
            if not (time(0, 0) <= horario_inicio <= time(23, 59)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El horario de inicio '{horario_inicio}' está fuera del rango permitido (00:00:00 - 23:59:59)."
                )

            if not (time(0, 0) <= horario_fin <= time(23, 59)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El horario final '{horario_fin}' está fuera del rango permitido (00:00:00 - 23:59:59)."
                )

            # Validar que la duración en minutos + horario inicial no exceda las 23:59:59 del mismo día.
            horario_calculado = horario_inicio_minutos + duracion
            if horario_calculado >= 24 * 60:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La duración en minutos sumada al horario inicial excede las 23:59:59 del mismo día."
                )
           
           
            # import pdb; pdb.set_trace()
            # Validar que horario_inicio sea menor que horario_fin
            if horario_inicio > horario_fin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El horario de inicio debe ser menor que el horario final."
                )

            # Validar que la diferencia sea al menos 30 minutos
            if (horario_fin_minutos - horario_inicio_minutos) < 30:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La diferencia entre el horario inicial y final debe ser de al menos 30 minutos."
                )   

            # Obtener todas las reservas de la misma cancha y día
            reservas_existentes = db.query(ReservaBd).filter(
                ReservaBd.idCancha == cancha.id,
                ReservaBd.dia == dia
            ).all()

            # Verificar solapamiento de horarios
            for reserva in reservas_existentes:
                reserva_inicio_minutos = time_to_minutes(reserva.horario)
                reserva_fin_minutos = time_to_minutes(reserva.horarioFinal)
                if not (
                    (horario_fin_minutos <= reserva_inicio_minutos) or
                    (horario_inicio_minutos >= reserva_fin_minutos)
                ):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Conflicto de horario: Ya existe una reserva para este horario en la cancha "
                        f"'{cancha.nombre}' entre las {reserva.horario} y {reserva.horarioFinal}."
                    )

            #Commit
            try:
                reserva_data = datos.model_dump()
                reserva_data["cancha"] = cancha

                nueva_reserva = ReservaBd(**reserva_data)
            
                db.add(nueva_reserva)
                db.commit()
                db.refresh(nueva_reserva)    
            except SQLAlchemyError as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error al guardar la reserva en la base de datos: {str(e)}"
                )
            
            return nueva_reserva   
        except Exception as e:
            self.handle_exception(e)

    def editar(self, db: Session, id: int, data: ReservaSinId):
        try:
            reserva_editar = self.get_by_id(db, id)
            if reserva_editar is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada")

            if data.idCancha:
                cancha = CanchasRepository().get_by_id(db, data.idCancha)
                if not cancha:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cancha no encontrada")
                reserva_editar.idCancha = data.idCancha
                reserva_editar.cancha = cancha
            #import pdb; pdb.set_trace()
            dia = data.dia
            horario_inicio = data.horario
            horario_fin = data.horarioFinal
            duracion = data.duracion
            def time_to_minutes(t: time):
                return t.hour * 60 + t.minute

            horario_inicio_minutos = time_to_minutes(horario_inicio)
            horario_fin_minutos = time_to_minutes(horario_fin)  
            
            # Validar que los horarios estén en el rango de un día
            if not (time(0, 0) <= horario_inicio <= time(23, 59)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El horario de inicio '{horario_inicio}' está fuera del rango permitido (00:00:00 - 23:59:59)."
                )
                
            if not (time(0, 0) <= horario_fin <= time(23, 59)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El horario final '{horario_fin}' está fuera del rango permitido (00:00:00 - 23:59:59)."
                )
                
            
            # Validar que la duración en minutos + horario inicial no exceda las 23:59:59 del mismo día.
            horario_calculado = horario_inicio_minutos + duracion
            if horario_calculado >= 24 * 60:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La duración en minutos sumada al horario inicial excede las 23:59:59 del mismo día."
                )
                
            # Validar que horario_inicio sea menor que horario_fin
            if horario_inicio >= horario_fin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El horario de inicio debe ser menor que el horario final."
                )
            
            # Validar que la diferencia sea al menos 30 minutos
            if (horario_fin_minutos - horario_inicio_minutos) < 30:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La diferencia entre el horario inicial y final debe ser de al menos 30 minutos."
                )   
                
            # Obtener todas las reservas de la misma cancha y día
            reservas_existentes = db.query(ReservaBd).filter(
                ReservaBd.idCancha == reserva_editar.idCancha,
                ReservaBd.dia == dia
            ).all()

            # Verificar solapamiento de horarios
            for reserva in reservas_existentes:
                if reserva.id != reserva_editar.id:
                    reserva_inicio_minutos = time_to_minutes(reserva.horario)
                    reserva_fin_minutos = time_to_minutes(reserva.horarioFinal)

                    # Si hay solapamiento, lanzar excepción
                    if not (
                        (horario_fin_minutos <= reserva_inicio_minutos) or
                        (horario_inicio_minutos >= reserva_fin_minutos)
                    ):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Conflicto de horario: Ya existe una reserva para este horario en la cancha "
                            f"'{reserva_editar.cancha.nombre}' entre las {reserva.horario} y {reserva.horarioFinal}."
                        )

            reserva_editar.dia = data.dia
            reserva_editar.horario = data.horario
            reserva_editar.horarioFinal = data.horarioFinal
            reserva_editar.duracion = data.duracion
            reserva_editar.nombreContacto = data.nombreContacto
            reserva_editar.telefonoContacto = data.telefonoContacto

            db.commit()
            db.refresh(reserva_editar)
            return reserva_editar

        except Exception as e:
           # print(e)
            db.rollback()
            self.handle_exception(e)

    def eliminar(self, db: Session, id: int):
        try:    
            reserva = self.get_by_id(db, id)
            if not reserva:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Reserva no encontrada"
                )
            db.delete(reserva)
            db.commit()
            return reserva
        except Exception as e:
            db.rollback()
            self.handle_exception(e)
        
    def buscar(self, db: Session, id: int):
        return db.query(ReservaBd).get(id)
    
    def filtrar_reservas_por_dia_y_cancha(self, db: Session, 
                                         dia: Optional[datetime.date] = None, 
                                         nombre_cancha: Optional[str] = None 
                                         ):
        try:
            query = db.query(ReservaBd).join(CanchaBd)

            filtros = []
            if nombre_cancha:
                filtros.append(CanchaBd.nombre.ilike(f"%{nombre_cancha}%"))
            if dia:
                filtros.append(ReservaBd.dia == dia)

            if filtros:
                query = query.filter(and_(*filtros))

            reservas = query.all()

            if filtros and not reservas:
                detalle= ''
                if len(filtros) == 2:
                    detalle =f"No se encontraron reservas para la cancha '{nombre_cancha}' el día {dia.strftime('%Y-%m-%d')}"
                elif nombre_cancha:
                    detalle =f"No se encontraron reservas para la cancha '{nombre_cancha}'"
                elif dia:
                    detalle =f"No se encontraron reservas el día {dia.strftime('%Y-%m-%d')}"
                    
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=detalle
                )

            return reservas
        except Exception as e:
            self.handle_exception(e)
        

    def handle_exception(self, e: Exception, mensaje: str = None):
        if isinstance(e, HTTPException): 
            raise HTTPException(status_code=e.status_code, detail=e.detail)
        elif isinstance(e, SQLAlchemyError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error en la base de datos: {str(e)}"
            )
        else:
            detail = mensaje or str(e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="asdkj")