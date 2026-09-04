import { render } from 'preact';
import { App } from './app';
import { watchForServiceWorkerUpdate } from './utils/appUpdate';
import './styles/global.css';

// se esce una versione nuova mentre l'app è aperta, si riparte da quella:
// altrimenti il codice vecchio resta a chiedere file che non esistono più
watchForServiceWorkerUpdate();

render(<App />, document.getElementById('app')!);
