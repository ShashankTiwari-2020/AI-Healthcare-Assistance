@'
# MediConnect AI — Milestone 2

## Overview
MediConnect AI is a healthcare-assistance application designed to help users understand health information in accessible language.

## Current features
- React and Vite frontend
- FastAPI backend
- User authentication APIs
- AI-assisted health chat
- Medical document analysis endpoint

## Setup
See the frontend and backend README files for setup instructions.

## Security and medical disclaimer
Do not commit API keys, credentials, environment files, or patient-identifiable information.
AI-generated explanations are informational and do not replace advice from a qualified healthcare professional.
'@ | Set-Content -Encoding utf8 (Join-Path $destination "README.md")