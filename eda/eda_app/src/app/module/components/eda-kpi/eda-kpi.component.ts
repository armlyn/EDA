import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { EdaKpi } from './eda-kpi';
import es from '@angular/common/locales/es';

@Component({
    selector: 'eda-kpi',
    templateUrl: './eda-kpi.component.html'
})

export class EdaKpiComponent implements OnInit {
    @Input() inject: EdaKpi;
    @Output() onNotify: EventEmitter<any> = new EventEmitter();
    @ViewChild('kpiContainer')
    kpiContainer: ElementRef;
    @ViewChild('sufixContainer')
    sufixContainer: ElementRef;

    sufixClick: boolean = false;
    color : string ;
    defaultColor = '#67757c';
    warningColor =  '#ff8100';
    containerHeight: number = 20;
    containerWidth: number = 20;

    constructor() { }

    ngOnInit() {
        registerLocaleData( es );
        try{
            if(this.inject.alertLimits.length > 0){
                this.inject.alertLimits.forEach(alert => {
                    const operand = alert.operand, warningColor = alert.color;
                    const value1 = this.inject.value, value2 = alert.value;
                    if(this.color !== this.defaultColor) this.defaultColor = this.color;
                    switch(operand){
                        case '<': this.color = value1 < value2  ?  warningColor  : this.defaultColor; break;
                        case '=': this.color = value1 === value2 ?  warningColor : this.defaultColor; break;
                        case '>': this.color = value1 > value2   ?  warningColor : this.defaultColor; break;
                        default : this.color = this.defaultColor;
                    }
                });
            }
        }catch(e){
            console.log('No alert limits defined (alertLimits)');
            console.log(e);
        }
    }

    setSufix(): void {
        this.sufixClick = !this.sufixClick;
        this.onNotify.emit({sufix : this.inject.sufix})
    }

    getStyle():any{
        return { 'font-weight': 'bold','font-size': this.getFontSize(), display: 'flex','justify-content':'center',color:this.color}
    }
   
    /**
     * This function returns a string with the given font size (in px) based on the panel width and height 
     * @returns {string}
    */
    getFontSize():string{
        let resultSize:number = 1;

        resultSize = this.containerHeight/2;
        
        let textLongitude = (this.inject.value + this.inject.sufix).length;

        let textWidth = textLongitude * resultSize;
        
        if (textWidth > this.containerWidth) resultSize = this.containerWidth / textLongitude;
    
        if (resultSize > this.containerHeight) resultSize = this.containerHeight;
        
        if (textLongitude * resultSize > this.containerWidth * 1.5) resultSize = resultSize / 1.8;
        
        return resultSize.toFixed().toString() +'px';
    }
    
     
    
    

    ngAfterViewInit() {
        const width = this.kpiContainer.nativeElement.offsetWidth;
        const height = this.kpiContainer.nativeElement.offsetHeight;
        const elementReference = this.sufixContainer.nativeElement;
         
        if( width > 0 ){
            this.containerHeight = height  ;
            this.containerWidth = width  ;
        } 
        if(height < 200){
            elementReference.style.margin =  "0 0 10%";
           
        }
        if(height > width){
            elementReference.style.marginTop = "30%";
        }
        if(width > height && height > 200){
            elementReference.style.marginTop =  ((height/3)).toFixed() + "px";
            elementReference.style.marginBottom =  ((height/3)).toFixed() + "px"; 
        }
       
        

      }
      



}
