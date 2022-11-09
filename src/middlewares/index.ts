import passport from "passport";
// import { Request, Response, NextFunction } from 'express';
// import { EAdminType } from 'models/general';

// const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (![EAdminType.ADMIN, EAdminType.SUPER_ADMIN].includes(req.user?.adminTypeId || 0)) {
//     return res.onError({
//       status: 401,
//       detail: "The user is not an administrator"
//     });
//   }
//   next();
// };

export const auth = passport.authenticate('jwt', { session: false })


// export const admin = [auth, isAdmin]

export default {
  auth,
  // admin
};