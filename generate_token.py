import jwt
import datetime

secret = "577b64079224274ecb0eaba23002e415b1979018982b872a977a6b2975a3c8895945ee168bf0aaa5de2ed36b2767e5cfb6bf92a2e177ac6e787c65de3bda71a8f74a732e2cc9ab06f54d8daec810e2d3b38048f1a69f8a8c34914ac594e978ffc4a224586ef19c50763c8017890cb7b94e9414d3b313ede7aa0747e18b1a8d0b25f65b8f9d881807ddbca4a92bdc84378e584732edde2602d52c33e66e69172216e896d8b4556b2bcc08dea115cdfe4279100a71bf8ba0413226c036fdb68b1a8246cbb515d39ab9550e5911c6852cb131d5423cf7b2e76ba9d9e2040b39551d3d9eb45aa5e873b7060a27aa4a79748ca2610b0257c933297c988a64e46e6f84"

payload = {
    "roles": ["ROLE_ADMINISTRADOR", "ROLE_JEFE", "ROLE_FUNCIONARIO"],
    "nombreUsuario": "ENZO ALEJANDRO RAMIREZ SILVA",
    "nombreUnidad": "PLANA MAYOR DE LA SUBDIPOL",
    "siglasUnidad": "PMSUBDIPOL",
    "isAdmin": True,
    "sub": "ERAMIREZS",
    "iat": 1678886400,
    "exp": 9999999999
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
