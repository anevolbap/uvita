# Uvita

Uso una hoja de cálculo de Google para registrar los pagos de mi
crédito hipotecario UVA (Unidad de Valor Adquisitivo). Para
automatizar la consulta del valor UVA correspondiente al primer día
hábil después del 10 de cada mes, ensayé una solución utilizando [Apps
Script](https://developers.google.com/apps-script?hl=es-419). Esta
herramienta permite conectar una celda directamente con la [API de
Principales Variables del
BCRA](https://www.bcra.gob.ar/Catalogo/apis.asp?fileName=principales-variables-v2&sectionName=Estad%EDsticas).

## Ejemplos

### A mano
Para consultar el valor de la UVA del día mediante la API del BCRA, desde la terminal:
``` shell
URL="https://api.bcra.gob.ar/estadisticas/v4.0"
ENDPOINT="monetarias"
ID=31 # variable UVA
FECHA=$(date +%Y-%m-%d) # fecha actual

curl "$URL/$ENDPOINT/$ID?desde=$FECHA&hasta=$FECHA"
```

### Con Apps Script
Las funciones auxiliares del archivo `uva.gs` se pueden llamar
directamente desde una celda como una fórmula:
```
# por fecha
=fetchUvaValue("2024-12-10")

# por primer día hábil a partir del 10
=fetchUvaValue(getFirstWorkingDayAfterTenth(12, 2024))
```

![Ejemplo](./ejemplo.gif)

## Desarrollo con clasp

El código vive en este repo y se sincroniza con el editor de Apps Script
mediante [clasp](https://github.com/google/clasp):

``` shell
npm install -g @google/clasp
clasp login
clasp clone <SCRIPT_ID>   # genera .clasp.json (ignorado por git)
clasp push                # sube uva.gs y appsscript.json
```

El `SCRIPT_ID` está en la URL del proyecto de Apps Script. El manifiesto
`appsscript.json` fija la zona horaria en `America/Argentina/Buenos_Aires`.

## Links relevantes

- https://github.com/Jaldekoa/BCRA-Wrapper/
