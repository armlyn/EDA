import * as  express from 'express';
import { authGuard } from '../../guards/auth-guard';
import { roleGuard } from '../../guards/role-guard';
import { DataSourceController } from './datasource.controller';
import { DashboardController } from '../dashboard/dashboard.controller';

const router = express.Router();

/**
 * @openapi
 * /datasource/:
 *   get:
 *     description: Get all existing data sources in the current database
 *     responses:
 *       200:
 *         description: Returns all existing dashboards
 *       404:
 *         description: Error loading datasources
 *     tags:
 *       - DataSource Routes
 */
router.get('', authGuard, roleGuard,  DataSourceController.GetDataSources);

/**
 * @openapi
 * /datasource/names:
 *   get:
 *     description: Get all data sources names in the current database 
 *     responses:
 *       200:
 *         description: Returns all dashboard names
 *       500:
 *         description: Error loading datasources
 *     tags:
 *       - DataSource Routes
 */
router.get('/names', authGuard,   roleGuard,  DataSourceController.GetDataSourcesNames);

/**
 * @openapi
 * /datasource/namesForDashboard:
 *   get:
 *     description: Get all the data sources names for each dashboard, filtered by permits and current users
 *     responses:
 *       200:
 *         description: Returns all available dashboard names 
 *       500:
 *         description: Error loading data sources
 *     tags:
 *       - DataSource Routes
 */
router.get('/namesForDashboard', authGuard,  DataSourceController.GetDataSourcesNamesForDashboard)

/**
 * @openapi
 * /datasource/namesForEdit:
 *   get:
 *     description: Get all data sources names for dashboard, filtered by permits and users
 *     responses:
 *       200:
 *         description: Returns all dashboards names available
 *       500:
 *         description: Error loading datasources
 *     tags:
 *       - DataSource Routes
 */
router.get('/namesForEdit', authGuard,  DataSourceController.GetDataSourcesNamesForEdit)

/**
 * @openapi
 * /datasource/check-connection:
 *   get:
 *     description: Checks the connection with the current database
 *     responses:
 *       200:
 *         description: Successful connection with the database 
 *       500:
 *         description: Can´t connect to the database
 *     tags:
 *       - DataSource Routes
 */
router.get('/check-connection', authGuard,   roleGuard, DataSourceController.CheckConnection);

/**
 * @openapi
 * /datasource/check-connection/{id}:
 *   get:
 *     description: Checks the connection with the current database for one specific datasource
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Returns okay, successful connection with the database and datasource
 *       500:
 *         description: Can't connect with the current database
 *     tags:
 *       - DataSource Routes
 */
router.get('/check-connection/:id', authGuard, roleGuard, DataSourceController.CheckStoredConnection);

/**
 * @openapi
 * /datasource/{id}:
 *   get:
 *     description: Get datasource by id parameter
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string 
 *     responses:
 *       200:
 *         description: Returns ok
 *       404:
 *         description: Can´t find datasource
 *     tags:
 *       - DataSource Routes
 */
router.get('/:id', authGuard,  roleGuard, DataSourceController.GetDataSourceById);

/**
 * @openapi
 * /datasource/add-data-source:
 *   post:
 *     description: Add a new datasource of any type
 *     parameters: 
 *       - name: datasource
 *         in: body
 *         required: true
 *         type: object
 *     responses:
 *       201:
 *         description: Creation of the new datasource successful
 *       500:
 *         description: Error trying to create the new datasource
 *     tags:
 *       - DataSource Routes
 */
router.post('/add-data-source/', authGuard,  roleGuard, DataSourceController.GenerateDataModel);

/**
 * @openapi
 * /datasource/query:
 *   post:
 *     description: Executes the query from the given panel
 *     parameters:
 *       - name: query
 *         in: body
 *         required: true
 *         type: object
 *     responses:
 *       200:
 *         description: Returns ok, the query has been executed 
 *       500:
 *         description: Returns error at querying, check your permissions and query syntax
 *     tags:
 *       - DataSource Routes 
 */
router.post('/query', authGuard,  roleGuard, DashboardController.execQuery);

/**
 * @openapi
 * /datasource/reload/{id}:
 *   post:
 *     description: Refresh the datasource by it's id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Returns ok
 *       500:
 *         description: Error trying to refresh the datasource
 *     tags:
 *       - DataSource Routes 
 */
router.post('/reload/:id', authGuard, roleGuard, DataSourceController.RefreshDataModel);

/**
 * @openapi
 * /datasource/remove-cache:
 *   post:
 *     description: Remove cache from model id
 *     parameters:
 *       - name: id
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Returns ok
 *     tags:
 *       - DataSource Routes 
 */
router.post('/remove-cache', authGuard,  roleGuard, DataSourceController.removeCacheFromModel);

/**
 * @openapi
 * /datasource/{id}:
 *   put:
 *     description: Remove cache from model by it's id
 *     parameters: 
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Datasource updated
 *       500:
 *         description: Datasource not found
 *     tags:
 *       - DataSource Routes 
 */
router.put('/:id', authGuard,  roleGuard,DataSourceController.UpdateDataSource);

/**
 * @openapi
 * /datasource/{id}:
 *   delete:
 *     description: Remove datasource by it's id
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *     responses:
 *       200:
 *         description: Datasource successfully removed
 *       500:
 *         description: Datasource not found, error trying to remove this datasource
 *     tags:
 *       - DataSource Routes
 */
router.delete('/:id', authGuard,  roleGuard, DataSourceController.DeleteDataSource);

export default router;
