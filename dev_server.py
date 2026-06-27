import sys
import os
import importlib.util
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="FastAPI Combined Local Dev Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def import_route_app(file_path):
    module_name = os.path.basename(os.path.dirname(file_path)).replace("(", "").replace(")", "").replace("[", "").replace("]", "")
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module.app

# Import and include routers from each sub-app directly
sub_apps = [
    "app/api/(auth)/(auth)/signup/route.py",
    "app/api/(auth)/(auth)/verify/route.py",
    "app/api/(auth)/(auth)/profile/route.py",
    "app/api/(auth)/(auth)/logout/route.py",
    "app/api/(auth)/(auth)/auth/[...nextauth]/route.py",
    "app/api/(auth)/(auth)/forgot-password/route.py",
    "app/api/(auth)/(auth)/reset-password/route.py"
]

for path in sub_apps:
    try:
        sub_app = import_route_app(path)
        # Use include_router so FastAPI compiles and caches the routes correctly
        app.include_router(sub_app.router)
        print(f"Successfully loaded router from: {path}")
    except Exception as e:
        print(f"Could not load router from {path}: {e}")

if __name__ == "__main__":
    print("Starting combined FastAPI backend on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
