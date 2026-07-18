import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import prisma from '../config/db.js';

export const verifyToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }
    if (user.accountStatus !== 'Active') {
      throw new ApiError(401, 'User account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token failed');
  }
});
