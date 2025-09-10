# Payway Integration

Esta implementación reemplaza Mercado Pago con Payway para el procesamiento de pagos.

## Configuración de Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` cuando quieras usar Payway:

```env
# Producción
PAYWAY_SITE_ID=93000570
PAYWAY_PUBLIC_API_KEY=6b184d2ca2c84cdaaca145d2376cf16c
PAYWAY_PRIVATE_API_KEY=89acc10b8c7342649c019451f5728322
PAYWAY_BASE_URL=https://developers.decidir.com/api/v2

# Sandbox (Test)
PAYWAY_SITE_ID=93000537
PAYWAY_PUBLIC_API_KEY=tbvrV7wp9nAPOrzfNVJ4D0JQq6p8JwDw
PAYWAY_PRIVATE_API_KEY=6p5CQoksoatpjbKIuNiHey52etMjirTG
PAYWAY_BASE_URL=https://developers.decidir.com/api/v2
```

## Endpoints Implementados

### 1. Crear Token de Pago
**POST** `/payway/token`

Tokeniza los datos de la tarjeta de crédito para procesamiento seguro.

```json
{
  "card_number": "4507990000004905",
  "card_expiration_month": "12",
  "card_expiration_year": "30",
  "security_code": "123",
  "card_holder_name": "Juan Perez",
  "card_holder_identification": {
    "type": "dni",
    "number": "12345678"
  }
}
```

**Respuesta:**
```json
{
  "id": "TOKEN_ID",
  "status": "active",
  "bin": "450799",
  "last_four_digits": "4905",
  "expiration_month": 12,
  "expiration_year": 30,
  "date_created": "2024-01-01T10:00:00Z",
  "cardholder": {
    "name": "Juan Perez",
    "identification": {
      "type": "dni",
      "number": "12345678"
    }
  }
}
```

### 2. Procesar Pago
**POST** `/payway/payment`

Procesa el pago utilizando el token obtenido anteriormente.

```json
{
  "site_transaction_id": "TX0001",
  "token": "TOKEN_ID_OBTENIDO",
  "payment_method_id": 1,
  "bin": "450799",
  "amount": 10000,
  "currency": "ARS",
  "installments": 1,
  "description": "Compra en mi tienda",
  "payment_type": "single"
}
```

**Respuesta:**
```json
{
  "id": 12345,
  "site_transaction_id": "TX0001",
  "payment_method_id": 1,
  "amount": 10000,
  "currency": "ARS",
  "status": "approved",
  "status_details": {
    "ticket": "123456",
    "card_authorization_code": "ABC123",
    "address_validation_code": "VVV"
  },
  "date": "2024-01-01T10:00:00Z",
  "installments": 1,
  "payment_type": "single"
}
```

### 3. Consultar Pago (Adicional)
**GET** `/payway/payment/:id`

Consulta el estado de un pago específico.

## Tarjetas de Prueba (Sandbox)

Para pruebas en el entorno sandbox, utiliza estas tarjetas:

- **Visa:** 4507 9900 0000 4905, Vto: 12/30, Cod. Seg.: 123
- **MasterCard:** Número no especificado, Vto: 12/30, Cod. Seg.: 123
- **Cabal:** 5896 5700 0000 0008, Vto: 12/30, Cod. Seg.: 123

## Flujo de Pago

1. **Frontend:** Envía los datos de la tarjeta a `POST /payway/token`
2. **Backend:** Retorna el token de la tarjeta
3. **Frontend:** Envía el token y datos de pago a `POST /payway/payment`
4. **Backend:** Procesa el pago y retorna el resultado
5. **Opcional:** Consulta el estado del pago con `GET /payway/payment/:id`

## Notas Importantes

- El monto (`amount`) debe enviarse en centavos (ej: 10000 = $100.00)
- Usa las credenciales de sandbox para pruebas
- Usa las credenciales de producción solo en el ambiente de producción
- Los tokens tienen un tiempo de vida limitado
- Siempre maneja los errores apropiadamente en el frontend

## Notas sobre la Configuración

- Las variables de entorno de Payway son **opcionales**
- Si no están configuradas, la aplicación seguirá funcionando normalmente
- Los endpoints de Payway retornarán un error `503 Service Unavailable` si intentas usarlos sin configurar las credenciales
