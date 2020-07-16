import Mirrorpanel from 'facade/mirrorpanel'; //Importación del plugin que desarrollamos para trabajar

M.language.setLang('es'); //Español
//M.language.setLang('en');//Inglés

const map = M.map({
  container: 'mapjs',
  center: {
    x: -667143.31,
    y: 4493011.77,
  },
  controls: ['scale', 'location', 'layerswitcher'],
  projection: "EPSG:3857*m",
  zoom: 8,
});

let capasPNOA = [
  'WMS*PNOA 2015*https://www.ign.es/wms/pnoa-historico*PNOA2015',
  'WMS*PNOA 2016*https://www.ign.es/wms/pnoa-historico*PNOA2016',
  'WMS*PNOA 2017*https://www.ign.es/wms/pnoa-historico*PNOA2017',
  'WMS*PNOA 2018*https://www.ign.es/wms/pnoa-historico*PNOA2018',
];

let defaultBaseLyrs = [
  new M.layer.WMTS({
    url: 'http://www.ign.es/wmts/ign-base?',
    name: 'IGNBaseTodo',
    legend: 'Mapa IGN',
    matrixSet: 'GoogleMapsCompatible',
    transparent: false,
    displayInLayerSwitcher: false,
    queryable: false,
    visible: true,
    format: 'image/jpeg',
  }),
  new M.layer.WMTS({
    url: 'http://www.ign.es/wmts/pnoa-ma?',
    name: 'OI.OrthoimageCoverage',
    legend: 'Imagen (PNOA)',
    matrixSet: 'GoogleMapsCompatible',
    transparent: false,
    displayInLayerSwitcher: false,
    queryable: false,
    visible: true,
    format: 'image/jpeg',
  }),
  new M.layer.WMTS({
    url: 'https://wmts-mapa-lidar.idee.es/lidar?',
    name: 'EL.GridCoverageDSM',
    legend: 'Modelo Digital de Superficies LiDAR',
    matrixSet: 'GoogleMapsCompatible',
    transparent: false,
    displayInLayerSwitcher: false,
    queryable: false,
    visible: true,
    format: 'image/png',
  }),
  new M.layer.WMTS({
    url: 'http://www.ideandalucia.es/geowebcache/service/wmts?',
    name: 'orto_2010-11',
    legend: 'orto_2010-11',
    matrixSet: 'SIG-C:25830',
    transparent: false,
    displayInLayerSwitcher: false,
    queryable: false,
    visible: true,
    format: 'image/png',
  })
]

const mpMirrorPanel = new Mirrorpanel({
  position: 'TR',
  collapsible: true, // El botón para desplegar/replegar el plugin no aparece (false) o sí aparece(true)
  collapsed: false, // El panel del plugin se muestra desplegado (false) o replegado (true)
  modeViz: 0,
  mirrorLayers: capasPNOA,
  defaultBaseLyrs: defaultBaseLyrs, // Array de capas para los mapas espejo en formato StringAPICNIG
  enabledKeyFunctions: true, // Están habilitadas los comandos por teclado
  showCursors: true, // Se muestran los cursores
});

map.addPlugin(mpMirrorPanel);