import { filter } from 'rxjs/operators';
import { EdaKnob } from './../../../eda-knob/edaKnob';
import { EdaKnobComponent } from './../../../eda-knob/eda-knob.component';
import { EdaScatter } from './../../../eda-scatter/eda-scatter.component';
import { EdaTreeMap } from './../../../eda-treemap/eda-treemap.component';
import { TreeMap } from './../../../eda-treemap/eda-treeMap';
import { EdaD3Component } from './../../../eda-d3/eda-d3.component';
import { TableConfig } from './chart-configuration-models/table-config';
import {
    Component, OnInit, Input, SimpleChanges,
    OnChanges, ViewChild, ViewContainerRef, ComponentFactoryResolver,
    OnDestroy, Output, EventEmitter, Self, ElementRef, NgZone
} from '@angular/core';
import { EdaKpiComponent } from '../../../eda-kpi/eda-kpi.component';
import { EdaTableComponent } from '../../../eda-table/eda-table.component';
import { PanelChart } from './panel-chart';
import { ChartUtilsService } from '@eda/services/service.index';

import { Column } from '@eda/models/model.index';
import { EdaChartComponent } from '@eda/components/eda-chart/eda-chart.component';
import { EdaColumnDate } from '@eda/components/eda-table/eda-columns/eda-column-date';
import { EdaColumnNumber } from '@eda/components/eda-table/eda-columns/eda-column-number';
import { EdaColumnText } from '@eda/components/eda-table/eda-columns/eda-column-text';
import { EdaTable } from '@eda/components/eda-table/eda-table';
import { KpiConfig } from './chart-configuration-models/kpi-config';
import { EdaMapComponent } from '@eda/components/eda-map/eda-map.component';
import { EdaGeoJsonMapComponent } from '@eda/components/eda-map/eda-geoJsonMap.component';

import * as _ from 'lodash';
import { EdaMap } from '@eda/components/eda-map/eda-map';
import { EdaD3 } from '@eda/components/eda-d3/eda-d3';
import { EdaFunnelComponent } from '@eda/components/eda-funnel/eda-funnel.component';




@Component({
    selector: 'panel-chart',
    templateUrl: './panel-chart.component.html',
    styleUrls: []
})
export class PanelChartComponent implements OnInit, OnChanges, OnDestroy {
    ngOnDestroy(): void {
        this.destroyComponent();
    }

    @Input() props: PanelChart;
    @Output() configUpdated: EventEmitter<any> = new EventEmitter<any>(null);

    @ViewChild('chartComponent', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;


    /*Chart's containers for panel body and preview panel*/
    public componentRef: any;
    public currentConfig: any;
    public NO_DATA: boolean;

    constructor(public resolver: ComponentFactoryResolver,
        private chartUtils: ChartUtilsService,
        @Self() private ownRef: ElementRef,
        private zone: NgZone) { }


    ngOnInit(): void {
        this.NO_DATA = false;
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (this.props.data && this.props.data.values.length !== 0 && !this.props.data.values.reduce((a, b) => a && b.every(element => element === null), true)) {

            setTimeout(_ => {
                this.NO_DATA = false;
            })
            this.changeChartType();

        } else {
            this.destroyComponent();
            setTimeout(_ => {
                this.NO_DATA = true;
            })

        }
    }

    getDimensions() {
        return { width: this.ownRef.nativeElement.offsetWidth, height: this.ownRef.nativeElement.offsetHeight }
    }

    /**
     * changes chart Type
     */
    public changeChartType() {

        const type = this.props.chartType;
        if (['table', 'crosstable'].includes(type)) {
            this.renderEdaTable(type);
        }
        if (['doughnut', 'polarArea', 'bar', 'horizontalBar', 'line', 'barline'].includes(type)) {
            this.renderEdaChart(type);
        }
        if (type === 'kpi') {
            this.renderEdaKpi();
        }
        if (['geoJsonMap', 'coordinatesMap'].includes(type)) {
            this.renderMap(type);
        }
        if (type === 'parallelSets') {
            this.renderParallelSets();
        }
        if (type === 'treeMap') {
            this.renderTreeMap();
        }
        if (type === 'scatterPlot') {
            this.renderScatter();
        }
        if (type === 'knob') {
            this.renderKnob()
        }
        if (type === 'funnel') {
            this.renderFunnel();
        }
    }

    /**
     * renders a table component
     * @param type table or crosstable
     */
    private renderEdaTable(type) {
        if (type === 'table') {
            this.createEdatableComponent(type);
        }
        if (type === 'crosstable') {
            this.createEdatableComponent(type);
        }
    }

    /**
     * Renders edaChartComponent
     * @param type 
     */
    private renderEdaChart(type: string) {

        const isbarline = this.props.edaChart === 'barline';
        const isstacked = this.props.edaChart === 'stackedbar';

        const dataDescription = this.chartUtils.describeData(this.props.query, this.props.data.labels);
        const dataTypes = this.props.query.map(column => column.column_type);

        let values = _.cloneDeep(this.props.data.values);

        /**
        * add comparative
        */
        let cfg: any = this.props.config.getConfig();
        
        if (!!cfg.addComparative 
            && (['line', 'bar'].includes(cfg.chartType)) 
            && this.props.query.length === 2 
            && this.props.query.filter(field => field.column_type === 'date').length > 0
            && ['month', 'week'].includes(this.props.query.filter(field => field.column_type === 'date')[0].format) ) {

            values = this.chartUtils.comparePeriods(this.props.data ,this.props.query);
            let types = this.props.query.map(field => field.column_type);
            let dateIndex = types.indexOf('date');
            dataTypes.splice(dateIndex, 0, 'date');
            let dateCol = dataDescription.otherColumns.filter( c => c.index === dateIndex )[0];
            let newCol = {name:dateCol.name + '_newDate', index:dateCol.index + 1};
            dataDescription.otherColumns.push(newCol);
            dataDescription.totalColumns ++;

        }


        const chartData = this.chartUtils.transformDataQuery(this.props.chartType, values,
            dataTypes, dataDescription, isbarline);

        const minMax = this.props.chartType !== 'line' ? { min: null, max: null } : this.chartUtils.getMinMax(chartData);

        const manySeries = chartData[1].length > 10 ? true : false;
        const config = this.chartUtils.initChartOptions(this.props.chartType, dataDescription.numericColumns[0].name,
            dataDescription.otherColumns, manySeries, isstacked, this.getDimensions(), this.props.linkedDashboardProps, minMax);


        /**Add trend datasets*/
        cfg = this.props.config.getConfig();
        if (cfg.addTrend && (cfg.chartType === 'line')) {
            let trends = [];
            chartData[1].forEach(serie => {
                let trend = this.chartUtils.getTrend(serie);
                trends.push(trend);
            });
            trends.forEach(trend => chartData[1].push(trend));
        }

        let chartConfig: any = {};
        chartConfig.chartType = this.props.chartType;
        chartConfig.edaChart = this.props.edaChart;
        chartConfig.chartLabels = chartData[0];

        if (type === 'doughnut' || type === 'polarArea') {
            chartConfig.chartData = chartData[1];
        } else {
            chartConfig.chartDataset = chartData[1];
        }

        chartConfig.chartOptions = config.chartOptions;
        chartConfig.chartColors = this.chartUtils.recoverChartColors(this.props.chartType, this.props.config);

        chartConfig.linkedDashboardProps = this.props.linkedDashboardProps;


        this.createEdaChartComponent(chartConfig);
    }

    /**
     * Creates a chart component
     * @param inject chart configuration
     */
    private createEdaChartComponent(inject: any) {
        this.currentConfig = inject;
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaChartComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;
        this.configUpdated.emit();
    }

    /**
      * Creates a table component
      * @param inject chart configuration
      */
    private createEdatableComponent(type: string) {

        this.entry.clear();

        const factory = this.resolver.resolveComponentFactory(EdaTableComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = this.initializeTable(type, this.props.config.getConfig());
        this.componentRef.instance.inject.value = this.chartUtils.transformDataQueryForTable(this.props.data.labels, this.props.data.values);
        const config = this.props.config.getConfig();

        if (config) {

            this.componentRef.instance.inject.rows = (<TableConfig>config).visibleRows;
            this.setTableProperties((<TableConfig>config));

        }

        this.componentRef.instance.inject.onNotify.subscribe(data => {
            (<TableConfig>config).visibleRows = data;
        });
        this.componentRef.instance.inject.onSortPivotEvent.subscribe(data => {
            (<TableConfig>config).sortedSerie = data;
        });
        this.componentRef.instance.inject.onSortColEvent.subscribe(data => {
            (<TableConfig>config).sortedColumn = data;
        });
        this.currentConfig = this.componentRef.instance.inject;
        this.componentRef.instance.inject.linkedDashboardProps = this.props.linkedDashboardProps;
    }

    private setTableProperties(config: TableConfig) {
        this.componentRef.instance.inject.withColTotals = config.withColTotals;
        this.componentRef.instance.inject.withColSubTotals = config.withColSubTotals;
        this.componentRef.instance.inject.withRowTotals = config.withRowTotals;
        this.componentRef.instance.withTrend = config.withTrend;
        this.componentRef.instance.inject.resultAsPecentage = config.resultAsPecentage;
        this.componentRef.instance.inject.checkTotals(null, config.visibleRows);
        this.componentRef.instance.inject.sortedSerie = config.sortedSerie;
        this.componentRef.instance.inject.sortedColumn = config.sortedColumn;
        this.configUpdated.emit();
    }

    /**renderKnob */

    private renderKnob() {
        let chartConfig: EdaKnob = new EdaKnob();
        chartConfig.data = this.props.data;
        chartConfig.dataDescription = this.chartUtils.describeData(this.props.query, this.props.data.labels);
        chartConfig.color = this.props.config['config']['color'] ? this.props.config['config']['color'] : null;
        chartConfig.limits = this.props.config['config']['limits'] ? this.props.config['config']['limits'] : null;
        this.createEdaKnobComponent(chartConfig)

    }

    private createEdaKnobComponent(inject) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaKnobComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;
    }

    /**
   * Renders a KPIComponent
   */
    private renderEdaKpi() {
        let chartConfig: any = {};
        chartConfig.value = this.props.data.values[0][0];
        chartConfig.header = this.props.query[0].display_name.default;
        const config: any = this.props.config;
        const alertLimits = config.config.alertLimits;
        if (config) {
            chartConfig.sufix = (<KpiConfig>config.getConfig()).sufix;
            chartConfig.alertLimits = alertLimits;
        } else {
            chartConfig.sufix = '';
            chartConfig.alertLimits = [];
        }

        this.createEdaKpiComponent(chartConfig);

    }

    /**
     * creates a kpiComponent
     * @param inject 
     */
    private createEdaKpiComponent(inject: any) {

        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaKpiComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;
        this.componentRef.instance.onNotify.subscribe(data => {
            const kpiConfig = new KpiConfig(data.sufix, inject.alertLimits);
            (<KpiConfig><unknown>this.props.config.setConfig(kpiConfig));
        })
    }

    private renderMap(type: string) {
        let inject = new EdaMap();
        inject.div_name = 'map_' + (this.randomID()).toString();
        inject.data = this.props.data.values;
        inject.labels = this.props.query.map(field => field.display_name.default);
        inject.maps = this.props.maps;
        inject.query = this.props.query;
        inject.coordinates = this.props.config['config']['coordinates'] ? this.props.config['config']['coordinates'] : null;
        inject.zoom = this.props.config['config']['zoom'] ? this.props.config['config']['zoom'] : null;
        inject.color = this.props.config['config']['color'] ? this.props.config['config']['color'] : '#006400';
        inject.logarithmicScale = this.props.config['config']['logarithmicScale'] ? this.props.config['config']['logarithmicScale'] : false;
        inject.legendPosition = this.props.config['config']['legendPosition'] ? this.props.config['config']['legendPosition'] : 'bottomleft';
        inject.linkedDashboard = this.props.linkedDashboardProps;
        if (type === 'coordinatesMap') {
            this.createMapComponent(inject)
        } else {
            this.createGeoJsonMapComponent(inject);
        }
    }

    private createMapComponent(inject: EdaMap) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaMapComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;
    }

    private createGeoJsonMapComponent(inject: EdaMap) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaGeoJsonMapComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;
    }

    private renderParallelSets() {

        const dataDescription = this.chartUtils.describeData(this.props.query, this.props.data.labels);

        let inject: EdaD3 = new EdaD3;
        inject.size = this.props.size;
        inject.id = this.randomID();
        inject.data = this.props.data;
        inject.dataDescription = dataDescription;
        inject.colors = this.props.config.getConfig()['colors'];
        inject.linkedDashboard = this.props.linkedDashboardProps;

        this.createParallelSetsComponent(inject);
    }

    private createParallelSetsComponent(inject: any) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaD3Component);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;

    }

    private renderFunnel() {

        const dataDescription = this.chartUtils.describeData(this.props.query, this.props.data.labels);

        let inject: EdaD3 = new EdaD3;
        inject.size = this.props.size;
        inject.id = this.randomID();
        inject.data = this.props.data;
        inject.dataDescription = dataDescription;
        inject.colors = this.props.config.getConfig()['colors'];
        inject.linkedDashboard = this.props.linkedDashboardProps;

        this.createFunnelComponent(inject);
    }

    private createFunnelComponent(inject: any) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaFunnelComponent);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;

    }

    private renderTreeMap() {

        const dataDescription = this.chartUtils.describeData(this.props.query, this.props.data.labels);

        let inject: TreeMap = new TreeMap;
        inject.size = this.props.size;
        inject.id = this.randomID();
        inject.data = this.props.data;
        inject.dataDescription = dataDescription;
        inject.colors = this.props.config.getConfig()['colors'];
        inject.linkedDashboard = this.props.linkedDashboardProps;

        this.createTreeMap(inject);
    }

    private createTreeMap(inject: any) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaTreeMap);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;

    }

    private renderScatter() {

        const dataDescription = this.chartUtils.describeData(this.props.query, this.props.data.labels);

        let inject: TreeMap = new TreeMap;
        inject.size = this.props.size;
        inject.id = this.randomID();
        inject.data = this.props.data;
        inject.dataDescription = dataDescription;
        inject.colors = this.props.config.getConfig()['colors'];
        inject.linkedDashboard = this.props.linkedDashboardProps;

        this.createScatter(inject);
    }

    private createScatter(inject: any) {
        this.entry.clear();
        const factory = this.resolver.resolveComponentFactory(EdaScatter);
        this.componentRef = this.entry.createComponent(factory);
        this.componentRef.instance.inject = inject;

    }

    private randomID() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    /**
     * Destroys current component
     */
    public destroyComponent() {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    /**
     * Initializes table
     * @param type 
     * @param configs 
     */
    private initializeTable(type: string, configs?: any): EdaTable {
        const tableColumns = [];
        //console.log("WARNING! Unique names");
        for (let i = 0, n = this.props.query.length; i < n; i += 1) {

            const label = this.props.data.labels[i];
            const r: Column = this.props.query[i];

            if (_.isEqual(r.column_type, 'date')) {
                // No em surt aixoooo
                tableColumns.push(new EdaColumnDate({ header: r.display_name.default, field: label, description: r.description.default }));
            } else if (_.isEqual(r.column_type, 'numeric')) {
                // No em surt aixoooo
                tableColumns.push(new EdaColumnNumber({ header: r.display_name.default, field: label, description: r.description.default }))
            } else if (_.isEqual(r.column_type, 'text')) {
                // No em surt aixoooo
                tableColumns.push(new EdaColumnText({ header: r.display_name.default, field: label, description: r.description.default }));
            } else if (_.isEqual(r.column_type, 'text')) {
                // No em surt aixoooo
                tableColumns.push(new EdaColumnText({ header: r.display_name.default, field: label, description: r.description.default }));
            }
            else if (_.isEqual(r.column_type, 'coordinate')) {
                tableColumns.push(new EdaColumnNumber({ header: r.display_name.default, field: label, description: r.description.default }));
            }
        }
        if (type === 'table') {
            return new EdaTable({ cols: tableColumns, ...configs });
        } else if (type === 'crosstable') {
            return new EdaTable({ cols: tableColumns, pivot: true, ...configs });
        }

    }

    /**
     * @return current chart config
     */
    public getCurrentConfig() {
        return this.currentConfig;
    }


}