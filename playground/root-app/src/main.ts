import {insertImportMaps, renderLayout} from 'microtsm'
import routeLayout from './routelayout.html?raw'
import importMaps from './importmap.json'

insertImportMaps(importMaps)
renderLayout(routeLayout)