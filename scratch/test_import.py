import sys
import os
import importlib.util

def test_import(file_path):
    try:
        module_name = os.path.basename(os.path.dirname(file_path)).replace("(", "").replace(")", "").replace("[", "").replace("]", "")
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        print(f"✅ Success: {file_path}")
    except Exception as e:
        print(f"❌ Failed: {file_path}")
        import traceback
        traceback.print_exc()

sub_apps = [
    "app/api/(auth)/(auth)/signup/route.py",
    "app/api/(auth)/(auth)/verify/route.py",
    "app/api/(auth)/(auth)/profile/route.py",
    "app/api/(auth)/(auth)/logout/route.py",
    "app/api/(auth)/(auth)/auth/[...nextauth]/route.py"
]

for path in sub_apps:
    test_import(path)


