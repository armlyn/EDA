import express from 'express';
import AdminRouter from './module/admin/admin.router';
import DashboardRouter from './module/dashboard/dashboard.router';
import AddTableRouter from './module/addtabletomodel/addtable.router';
import DataSourceRouter from './module/datasource/datasource.router';
import UploadsRouter from './module/uploads/uploads.router';
import MailRouter from './module/mail/mail.router';
import DocuRouter from './routes/api/api-docs';
import AuthRouter from './middleware/keycloak/auth.router';

const router = express.Router();

router.use('/admin', AdminRouter);

router.use('/dashboard', DashboardRouter);

router.use('/datasource', DataSourceRouter);

router.use('/global/upload', UploadsRouter);

router.use('/addTable', AddTableRouter );

router.use('/mail', MailRouter);

/* ruta per documentació*/
router.use("/api-docs", DocuRouter);

/* ruta per SSO*/
router.use("/auth", AuthRouter);

export default router;
