import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Addons } from './pages/addons/addons';
import { Addon } from './addon/addon';
import { Register } from './pages/register/register';
import { Perfil } from './perfil/perfil';
import { Maps } from './pages/maps/maps';
import { Skins } from './pages/skins/skins';
import { Ranking } from './pages/ranking/ranking';

import { Home as CreatorHome } from './creator/home/home';
import { Creator } from './creator/creator';
import { MisCreaciones } from './creator/mis-creaciones/mis-creaciones';
import { CrearAddon } from './creator/mis-creaciones/crear-addon/crear-addon';
import { SubirArchivo } from './creator/mis-creaciones/subir-archivo/subir-archivo';
import { MisPublicaciones } from './creator/mis-publicaciones/mis-publicaciones';
import { Estadisticas } from './creator/estadisticas/estadisticas';
import { MiPerfil } from './creator/mi-perfil/mi-perfil';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'about', component: About },
    { path: 'contact', component: Contact },
    { path: 'addons', component: Addons },
    { path: 'maps', component: Maps },
    { path: 'skins', component: Skins },
    { path: 'ranking', component: Ranking },
    { path: 'addon/:id', component: Addon },
    { path: 'register', component: Register },
    { path: 'perfil/:id', component: Perfil },
    { 
        path: 'creator', 
        component: Creator,
        children: [
            { path: 'home', component: CreatorHome },
            { path: 'mis-creaciones', component: MisCreaciones },
            { path: 'mis-creaciones/crear-addon', component: CrearAddon },
            { path: 'mis-creaciones/subir-archivo/:idaddon', component: SubirArchivo },
            { path: 'mis-publicaciones', component: MisPublicaciones },
            { path: 'estadisticas', component: Estadisticas },
            { path: 'mi-perfil', component: MiPerfil },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '' },
];
