#!/bin/bash
uvicorn ai_backend.main:app --host 0.0.0.0 --port $PORT
