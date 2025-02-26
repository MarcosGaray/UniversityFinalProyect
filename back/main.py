from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import bd

from api.reservas_api import reservas_router
from api.canchas_api import canchas_router

bd.create_all()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservas_router)
app.include_router(canchas_router)