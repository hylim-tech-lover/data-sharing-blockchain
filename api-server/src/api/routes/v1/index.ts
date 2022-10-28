import { Router } from 'express';
import smartContractRoute from './smartContract.route';
import symEncryptRoute from './symEncryption.route';

const router = Router();

class Routers {
  path : string;
  route : Router;
}

const defaultRoutes : Routers[] = [
  {
    path: '/merchant',
    route: smartContractRoute,
  },
  {
    path: '/symEncrypt',
    route: symEncryptRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
