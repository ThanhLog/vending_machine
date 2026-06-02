from fastapi import FastAPI
from utils.logging import log_error, log_info, logging
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.user import router as user_router
from routers.template import router as template_router
from routers.template_html import router as template_html_router
from routers.template_user_data import router as template_user_data_router
from routers.template_order import router as template_order_router
from routers.wedding_profile import router as wedding_profile_router
from routers.upload_file import router as upload_file_router
from routers.invitation_slugs import router as invitation_slugs_router
from routers.wedding import router as wedding_router
from routers.notify import router as notify_router
from routers.feedback import router as feedback_router
from routers.faq import router as faq_router
from routers.chat_room import router as chat_room_router
from routers.guest_list import router as guest_list_router
from routers.logs import router as logs_router
from routers.analytics import router as analytics_router
from fastapi.staticfiles import StaticFiles


app = FastAPI(
    title="Wedding App API",
    # docs_url=None,
    # redoc_url=None,
)

origins = [
    "https://www.thiephaoy.online",
    "https://thiephaoy.online",
    "https://admin.thiephaoy.online",
    "https://storage.thiephaoy.online",
    "https://template.thiephaoy.online",
    "https://www.thiephaoy.shop",
    "https://thiephaoy.shop",
    "http://localhost:5173",
    "http://localhost:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_file_router)

app.include_router(notify_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(template_router)
app.include_router(template_html_router)
app.include_router(template_user_data_router)
app.include_router(template_order_router)
app.include_router(invitation_slugs_router)
app.include_router(wedding_profile_router)
app.include_router(wedding_router)
app.include_router(feedback_router)
app.include_router(faq_router)
app.include_router(chat_room_router)
app.include_router(guest_list_router)
app.include_router(logs_router)
app.include_router(analytics_router)


app.mount("/images", StaticFiles(directory="storage/images"), name="images")
app.mount("/files", StaticFiles(directory="storage/files"), name="files")
app.mount("/templates", StaticFiles(directory="storage/templates"), name="templates")
app.mount("/videos", StaticFiles(directory="storage/videos"), name="videos")
