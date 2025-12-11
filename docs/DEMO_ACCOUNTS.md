# Samay Platform - Demo Accounts & Setup Guide

This document describes the demo accounts and how to set up the Samay platform for testing and demonstration purposes.

## Quick Start

### 1. Start the Services

```bash
cd infra
podman-compose up -d --build
```

### 2. Seed the Database

After the services are running, seed the database with demo data:

```bash
# Connect to the database and run the seed script
podman exec -i samay_db psql -U samay -d samay < seed.sql
```

Or manually connect and run:

```bash
podman exec -it samay_db psql -U samay -d samay
\i /path/to/seed.sql
```

### 3. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:4000/api/v1 |
| **API Documentation** | http://localhost:4000/api/docs |

---

## Demo Accounts

Each role has a unique password for security:

### Super Admin Account

| Field | Value |
|-------|-------|
| **Email** | `admin@samay.io` |
| **Password** | `admin123` |
| **Role** | SuperAdmin |
| **Capabilities** | Full system access, user management, team governance, role administration |

The Super Admin can:
- View and manage all users
- Create and manage teams
- Promote Associates to Managers
- Access system settings
- View audit logs

### Manager Account

| Field | Value |
|-------|-------|
| **Email** | `manager@samay.io` |
| **Password** | `manager123` |
| **Role** | Manager |
| **Team** | Morning Crew |
| **Capabilities** | Team management, roster building, shift assignment |

The Manager can:
- Build and manage rosters
- Assign shifts to team members
- View team availability
- Run schedule optimization
- Claim unassigned associates

### Associate Account

| Field | Value |
|-------|-------|
| **Email** | `associate@samay.io` |
| **Password** | `associate123` |
| **Role** | Associate |
| **Team** | Morning Crew |
| **Manager** | Sarah Miller |
| **Capabilities** | View shifts, manage availability, request time off |

The Associate can:
- View assigned shifts
- Update availability preferences
- Request time off
- Swap shifts with team members

---

## Additional Demo Users

### Managers

| Name | Email | Team |
|------|-------|------|
| Sarah Miller | `manager@samay.io` | Morning Crew |
| Mike Johnson | `mike.johnson@samay.io` | Evening Crew |
| Emily Chen | `emily.chen@samay.io` | Night Shift |

### Associates (Morning Crew)

| Name | Email | Skills |
|------|-------|--------|
| Alex Johnson | `associate@samay.io` | Forklift, Customer Service, Opening |
| Maria Garcia | `maria.garcia@samay.io` | Cashier, Customer Service |
| David Lee | `david.lee@samay.io` | Inventory, Forklift |

### Associates (Evening Crew)

| Name | Email | Skills |
|------|-------|--------|
| James Wilson | `james.wilson@samay.io` | Cashier, Closing |
| Lisa Brown | `lisa.brown@samay.io` | - |
| Robert Taylor | `robert.taylor@samay.io` | - |

### Associates (Night Shift)

| Name | Email | Skills |
|------|-------|--------|
| Jennifer White | `jennifer.white@samay.io` | - |
| Michael Harris | `michael.harris@samay.io` | - |

### Unassigned Associates

| Name | Email |
|------|-------|
| New Associate1 | `new.associate1@samay.io` |
| Pending User | `new.associate2@samay.io` |
| Trainee Worker | `new.associate3@samay.io` |

---

## Demo Teams

| Team Name | Manager | Members | Description |
|-----------|---------|---------|-------------|
| Morning Crew | Sarah Miller | 3+ | 6 AM - 2 PM shifts |
| Evening Crew | Mike Johnson | 3+ | 2 PM - 10 PM shifts |
| Night Shift | Emily Chen | 2+ | 10 PM - 6 AM shifts |
| Weekend Team | (Unassigned) | 5 | Weekend coverage |
| Warehouse A | (Needs setup) | 15 | Primary warehouse ops |

---

## Available Skills

| Code | Name | Description |
|------|------|-------------|
| `skill_forklift` | Forklift Certified | Licensed forklift operation |
| `skill_cashier` | Cashier | Cash register/POS operation |
| `skill_inventory` | Inventory Management | Stock counting and organization |
| `skill_customer_service` | Customer Service | Customer-facing support |
| `skill_supervisor` | Supervisor | Team supervision |
| `skill_opening` | Opening Procedures | Store opening |
| `skill_closing` | Closing Procedures | Store closing |

---

## API Authentication

### Login Endpoint

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@samay.io",
  "password": "admin123"
}
```

### Response

```json
{
  "token": "<base64-encoded-token>",
  "user": {
    "id": "c0000001-0000-0000-0000-000000000001",
    "email": "admin@samay.io",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPERADMIN",
    "teamId": null,
    "teamName": null
  }
}
```

### Using the Token

Include the token in subsequent requests:

```http
Authorization: Bearer <token>
```

---

## Resetting Demo Data

To reset the database to the initial demo state:

```bash
# Stop services
cd infra
podman-compose down -v

# Restart and rebuild
podman-compose up -d --build

# Re-seed the database
podman exec -i samay_db psql -U samay -d samay < seed.sql
```

---

## Troubleshooting

### Cannot connect to database

Ensure the PostgreSQL container is running:

```bash
podman ps | grep samay_db
```

### Login not working

1. Verify the seed script ran successfully
2. Check the backend logs: `podman-compose logs backend`
3. Ensure you're using the correct password for each role:
   - SuperAdmin: `admin123`
   - Manager: `manager123`
   - Associate: `associate123`

### Frontend shows no data

1. Check backend is running: `curl http://localhost:4000/api/v1/health`
2. Verify CORS settings allow your frontend origin
3. Check browser console for API errors

---

## Production Deployment Notes

⚠️ **Important**: The demo accounts and seed data are for development/testing only.

For production deployment:

1. **Remove demo accounts** - Delete the seed.sql data
2. **Implement proper authentication** - Use bcrypt for passwords, JWT with secret
3. **Enable HTTPS** - Configure SSL/TLS certificates
4. **Set secure environment variables** - Use secrets management
5. **Configure proper CORS** - Restrict to your production domain

---

## Support

For issues or questions:
- Check the [README.md](../README.md) for architecture details
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Submit issues on GitHub

