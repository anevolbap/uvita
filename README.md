# Uvita

Uso una hoja de cálculo de Google para registrar los pagos de mi
crédito hipotecario UVA (Unidad de Valor Adquisitivo). Para
automatizar la consulta del valor UVA correspondiente al primer día
hábil a partir del 10 de cada mes, ensayé una solución utilizando [Apps
Script](https://developers.google.com/apps-script?hl=es-419). Esta
herramienta permite conectar una celda directamente con la [API de
Estadísticas Monetarias del
BCRA](https://principales-variables.bcra.apidocs.ar/).

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
directamente desde una celda como una fórmula.

Por fecha:
``` text
=fetchUvaValue("2024-12-10")
```

Por el primer día hábil a partir del 10 de un mes:
``` text
=fetchUvaValue(getFirstWorkingDayAfterTenth(12, 2024))
```

`getFirstWorkingDayAfterTenth` salta sábados, domingos y feriados argentinos.
Los feriados se consultan en [argentinadatos](https://argentinadatos.com/) y se
toman todos los días listados (feriados y días no laborables). Si esa consulta
falla, solo se saltan los fines de semana.

`fetchUvaValue` y la lista de feriados se cachean 6 horas con `CacheService`,
así una hoja con muchas celdas no repite el mismo pedido en cada recálculo.

![Ejemplo](./ejemplo.gif)

## Desarrollo con clasp

El código vive en este repo y se sincroniza con el editor de Apps Script
mediante [clasp](https://github.com/google/clasp):

``` shell
npm install -g @google/clasp
clasp login
clasp clone <SCRIPT_ID>   # genera .clasp.json (ignorado por git)
clasp push                # sube uva.gs, tests.gs y appsscript.json
```

El `SCRIPT_ID` está en la URL del proyecto de Apps Script. El manifiesto
`appsscript.json` fija la zona horaria en `America/Argentina/Buenos_Aires`.

Este repo es la fuente de verdad: el flujo normal es editar acá y `clasp
push`. `clasp clone` y `clasp pull` traen los archivos remotos y pueden
sobrescribir los locales, usalos solo en un directorio vacío o para la
configuración inicial.

## Tests

`tests.gs` prueba la lógica pura de fechas (sin red ni servicios de Apps
Script). Para correrlos, abrir el editor de Apps Script, elegir `runTests` y
presionar Run, o desde la terminal:

``` shell
clasp run runTests
```

El resultado (PASS/FAIL por caso) queda en el log de ejecución.

## Links relevantes

- https://github.com/Jaldekoa/BCRA-Wrapper/
