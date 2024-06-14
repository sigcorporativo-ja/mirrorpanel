/**
 * @module M/control/MirrorpanelControl
 */

import MirrorpanelImplControl from 'impl/mirrorpanelcontrol';
import template from 'templates/mirrorpanel';
import { getValue as getValueTranslate } from './i18n/language';

export default class MirrorpanelControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(values) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(MirrorpanelImplControl)) {
      M.exception('La implementación usada no puede crear controles MirrorpanelControl');
    }
    // 2. implementation of this control
    const impl = new MirrorpanelImplControl();
    super(impl, 'Mirrorpanel');

    /**
     * Template
     * @public
     * @type { HTMLElement }
     */
    this.template = null;

    /**
     * Visual mode
     * @private
     * @type {Number}
     */
    this.modeViz = values.modeViz;

    /**
     * Mirror maps with plugins
     * @private
     * @type {boolean}
     */
    this.showCursors = values.showCursors;

    /**
     * Defining mirror maps variables
     */
    this.mapL = { A: null, B: null, C: null, D: null, }
    this.lyrCursor = { A: null, B: null, C: null, D: null, }
    this.featureLyrCursor = { A: null, B: null, C: null, D: null, }

    /**
     * Defining cursor style
     */
    this.styleCursor = new M.style.Point({
      icon: {
        form: M.style.form.CIRCLE,
        fontsize: 0.5,
        radius: 5,
        rotation: 0,
        rotate: false,
        offset: [0, 0],
        color: 'black',
        fill: 'red',
        gradientcolor: '#088A85',
        opacity: 0.8
      }
    });

    /**
     * Default layers for mirror maps
     * @public
     * @public {Array}
     */
    this.defaultBaseLyrs = values.defaultBaseLyrs;

    /**
     * All layers
     * @public
     * @public {Array}
     */
    this.mirrorLayers = values.mirrorLayers;

    /**
     * Enable layerswitcher control
     * @public
     * @public {Array}
     */
    this.showTOC = values.showTOC;

    this.createMapContainers();
  }


  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    if (!M.template.compileSync) {
      M.template.compileSync = (string, options) => {
        let templateCompiled;
        let templateVars = {};
        let parseToHtml;
        if (!M.utils.isUndefined(options)) {
          templateVars = M.utils.extends(templateVars, options.vars);
          parseToHtml = options.parseToHtml;
        }
        const templateFn = Handlebars.compile(string);
        const htmlText = templateFn(templateVars);
        if (parseToHtml !== false) {
          templateCompiled = M.utils.stringToHtml(htmlText);
        } else {
          templateCompiled = htmlText;
        }
        return templateCompiled;
      };
    }

    this.mapL['A'] = map;
    if (this.mirrorLayers.length > 0) {
      this.mapL['A'].addLayers(this.mirrorLayers);
      this.mapL['A'].getLayers().forEach((l) => {
        if (l.zindex_ !== 0) { l.setVisible(false); }
      });
    }
    if (this.showCursors) { this.addLayerCursor('A'); }
    return new Promise((success, fail) => {
      let templateOptions = '';
      templateOptions = {
        jsonp: true,
        vars: {
          translations: {
            title: getValueTranslate('title'),
            modViz0: getValueTranslate('modViz0'),
            modViz1: getValueTranslate('modViz1'),
            modViz2: getValueTranslate('modViz2'),
            modViz3: getValueTranslate('modViz3'),
            modViz4: getValueTranslate('modViz4'),
            modViz5: getValueTranslate('modViz5'),
            modViz6: getValueTranslate('modViz6'),
            modViz7: getValueTranslate('modViz7'),
            modViz8: getValueTranslate('modViz8'),
            modViz9: getValueTranslate('modViz9')
          }
        }
      };

      this.template = M.template.compileSync(template, templateOptions);

      // Button's click events
      this.template.querySelectorAll('button[id^="set-mirror-"]')
        .forEach((button, modeViz) => {
          button.addEventListener('click', evt => {
            this.manageVisionPanelByCSSGrid(modeViz);
          })
        });

      // Apply default vision
      this.manageVisionPanelByCSSGrid(this.modeViz);
      success(this.template);
    });

  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    super.activate();
  }
  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    super.deactivate();
  }

  /**
   * Initial configurations for applying CSS grid.
   * 
   */
  createMapContainers() {
    const bigContainer = document.createElement('div');
    bigContainer.id = "lienzo";
    bigContainer.classList.add('mirrorpanel-grid');

    const mapjsA = document.getElementById("mapjs") || document.getElementById("map");
    mapjsA.parentNode.insertBefore(bigContainer, mapjsA);
    mapjsA.classList.add('mirror1');
    bigContainer.appendChild(mapjsA);

    const mapjsB = document.createElement('div');
    mapjsB.id = "mapjsB";
    mapjsB.classList.add('mirror2');
    bigContainer.appendChild(mapjsB);

    const mapjsC = document.createElement('div');
    mapjsC.id = "mapjsC";
    mapjsC.classList.add('mirror3');
    bigContainer.appendChild(mapjsC);

    const mapjsD = document.createElement('div');
    mapjsD.id = "mapjsD";
    mapjsD.classList.add('mirror4');
    bigContainer.appendChild(mapjsD);
  }

  /**
   * This function shows/hides panel for differents viz options.
   * The mirror maps are launched from here
   * 
   */
  manageVisionPanelByCSSGrid(modeViz) {
    let oldModeViz = this.modeViz;
    let map0 = document.getElementById('mapjs') || document.getElementById('map');
    map0.style.display = 'none';
    document.getElementById('mapjsB').style.display = 'none';
    document.getElementById('mapjsC').style.display = 'none';
    document.getElementById('mapjsD').style.display = 'none';
    this.template.querySelector('#set-mirror-' + oldModeViz).classList.remove('buttom-pressed');

    for (let i = 0; i < 10; i++) {
      document.getElementById('lienzo').classList.remove('modeViz' + i);
    }
    document.getElementById('lienzo').classList.add('modeViz' + modeViz);

    //Create map objects by modeviz
    if ([1, 2].includes(modeViz)) {
      if (this.mapL['B'] == null) {
        this.createMapObjects('B');//Create MapB
      }
    }
    if ([3, 7, 8, 9].includes(modeViz)) {
      if (this.mapL['B'] == null) {
        this.createMapObjects('B');//Create MapB
      }
      if (this.mapL['C'] == null) {
        this.createMapObjects('C');//Create MapC
      }
    }
    if ([4, 5, 6].includes(modeViz)) {
      if (this.mapL['B'] == null) {
        this.createMapObjects('B');//Create MapB
      }
      if (this.mapL['C'] == null) {
        this.createMapObjects('C');//Create MapC
      }
      if (this.mapL['D'] == null) {
        this.createMapObjects('D');//Create MapD
      }
    }

    this.modeViz = modeViz;
    this.template.querySelector('#set-mirror-' + modeViz).classList.add('buttom-pressed');
    this.map_.refresh();
    if (this.mapL['B'] !== null) { this.mapL['B'].refresh(); }
    if (this.mapL['C'] !== null) { this.mapL['C'].refresh(); }
    if (this.mapL['D'] !== null) { this.mapL['D'].refresh(); }
  }

  /**
   * Create mirror map object synchro with the main map
   */
  createMapObjects(mapLyr) {
    let defLyr = null;
    switch (mapLyr) {
      case 'B':
        if (this.defaultBaseLyrs[1]) defLyr = this.defaultBaseLyrs[0];
        break;
      case 'C':
        if (this.defaultBaseLyrs[2]) defLyr = this.defaultBaseLyrs[1];
        break;
      case 'D':
        if (this.defaultBaseLyrs[3]) defLyr = this.defaultBaseLyrs[2];
        break;
      default:
        defLyr = this.map_.getLayers()[0].setMap(this);
        break;
    }
    this.mapL[mapLyr] = M.map({
      container: 'mapjs' + mapLyr,
      layers: defLyr,
      controls: this.showTOC ? ['layerswitcher'] : '',
      center: this.map_.getCenter(),
      projection: this.map_.getProjection().code + '*' + this.map_.getProjection().units,
      zoom: this.map_.getZoom(),
    });
    setTimeout(() => {
      this.mapL[mapLyr].getMapImpl().setView(this.map_.getMapImpl().getView());
    }, 500);

    if (this.showCursors) { this.addLayerCursor(mapLyr); }
    if (this.mirrorLayers.length > 0) {
      this.mapL[mapLyr].addLayers(this.mirrorLayers);
      this.mapL[mapLyr].getLayers().forEach((l) => {
        if (l.zindex_ !== 0) { l.setVisible(false); }
      });
    }
    this.mapL[mapLyr].refresh();
  }

  /**
   * Adding a layer for cursor on Map
   */
  addLayerCursor(mapLyr) {
    // Cursor Layer
    this.lyrCursor[mapLyr] = new M.layer.Vector({
      name: 'Coordenadas centro ' + mapLyr,
    }, { displayInLayerSwitcher: false });

    this.featureLyrCursor[mapLyr] = new M.Feature('Center' + mapLyr, {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: this.mapL[mapLyr].getCenter(),
      },
    });

    setTimeout(() => {
      this.lyrCursor[mapLyr].addFeatures([this.featureLyrCursor[mapLyr]]);
    }, 2000);

    this.lyrCursor[mapLyr].setStyle(this.styleCursor);
    this.lyrCursor[mapLyr].setZIndex(5000);
    this.mapL[mapLyr].addLayers(this.lyrCursor[mapLyr]);

    this.mapL[mapLyr].getMapImpl().on('pointermove', (event) => {
      this.lyrCursor[mapLyr].setVisible(false);
      Object.keys(this.featureLyrCursor).forEach(k => {
        if (this.mapL[k]) {
          this.mapL[k].getMapImpl().setView(this.mapL[mapLyr].getMapImpl().getView());
        }
        if (k != mapLyr) {
          if (this.featureLyrCursor[k] !== null) {
            this.lyrCursor[k].setVisible(true);
            this.featureLyrCursor[k].setGeometry({
              type: 'Point',
              coordinates: event.coordinate,
            });
          }
        }
      })
    });

  }

  /**
   * This function is called to remove the effects
   *
   * @public
   * @function
   * @api stable
   */
  removeMaps() {
    this.mapL['B'] = null;
    this.mapL['C'] = null;
    this.mapL['D'] = null;
  }

  destroyMapsContainer() {
    // Remove mirrors containers
    document.getElementById("mapjsB").remove();
    document.getElementById("mapjsC").remove();
    document.getElementById("mapjsD").remove();

    // Take the main map out of the container
    const lienzo = document.getElementById("lienzo");
    const mapjsA = document.getElementById("mapjs") || document.getElementById("map");
    mapjsA.style.display = "block";
    mapjsA.classList.remove('mirror1');
    lienzo.parentNode.insertBefore(mapjsA, lienzo);

    // Load the main container
    document.getElementById("lienzo").remove();
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof MirrorpanelControl;
  }
}
