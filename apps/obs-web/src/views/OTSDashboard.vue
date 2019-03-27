<template>
    <div class="q-pa-md  ">
        <div class="text-h5">OTS Target Performance</div>
        <div class="text-h6">Entire Fishery</div>
        <p></p>
        <svg class="bar-chart"></svg>
        <div class="text-h6">Port Groups</div>
        <div style="border-left: 2px dashed gray; height: 150px; position: absolute; left: 1115px; z-index: -1000; padding-left: 5px; color: gray; font-weight: bold; ; margin-top: 0 ">100% of target</div>
        <div v-for="(row, i) in myData" :key="i">
            <div style="height: 22px; padding-left: 10px; font-weight: bold; color: white;display: inline-block; border-bottom: 1px dotted black" :style="{width: row.value * 4 + 'px', backgroundColor: row.color}" @click="goToTarget(i)">
            {{ row.label }}
            </div>
            <span style="position: relative; left: -100px; color: white; font-weight: bold">
                {{ (row.value / 200) * 100  }}% covered
            </span>
            <span style="font-weight: bold; position: relative; left: -80px"> {{ lessThanZero(row.value - 200) ? row.value - 200 : "+" + (row.value - 200).toString() }}</span>
        </div>

        <div class="text-h6">Vessels</div>
    </div>

</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';
import * as d3 from 'd3';
import { treemapSquarify } from 'd3';


@Component
export default class OTSDashboard extends Vue{
    
    private myData: any[] = [
            {label: "EM EFP", value: 150, color: "#2b78e4"}, 
            {label: "AT (Astoria, OR / Columbia River Ports)", value: 212, color: "#41b900"}, 
            {label: "BB (Bellingham - Tacoma, WA)", value: 130, color: "#ff4100"},
            {label: "Excalibur", value: 80, color: "#ff4100"}, 
            {label: "Raven", value: 200, color: "#2b78e4"}, 
            {label: "Fishwish", value: 92, color: "#ff4100"}
            ];    
    
    constructor() {
        super()
    }

    mounted() {

        var colors: any[] = ["#2b78e4", "#41b900", "#ff4100", "#ff4100", "#2b78e4", "#ff4100"]
        var svgWidth: number = 900, svgHeight: number = 300, barPadding: number = 5;
        var barWidth: number =  (50 )
        var barHeight: number = 30

        //text example
        // const dthree: any = d3.select(this.$el)
        // dthree
        //     .selectAll('p')
        //     .data(myData)
        //     .enter()
        //     .append('p')
        //     // .text('d3 is working')
        //     .text(function(d: number) {
        //         return 'the number is: ' + d;
        //     })

        //bar chart example
        var svg = d3.select('svg')
            .attr("width", svgWidth)
            .attr("height", svgHeight)

        var barChart = svg.selectAll("rect")
            .data(this.myData)
            .enter()
            .append("rect")
            .attr("x", 0)
            // .attr("height", function(d) { return d; })
            // .attr("width", barWidth - barPadding)

            .attr("height", barHeight - barPadding)
            .attr("width", function(d) { return d.value * 4; } )
            .attr("fill", function(d, i) {
                return colors[i]
                })

            .attr("transform", function(d,i) {
                var translate = [0, barWidth * i ];
                return "translate(" + translate + ")";
            })

        var text = svg.selectAll("text")
            .data(this.myData)
            .enter()
            .append("text")
            .text(function(d) {
                return (d.value / 200) * 100;
            })
            .attr("x", function(d, i) {
                return (d.value * 4) -30
            })
            .attr("y", function(d,i) {
                return (barWidth * i) + 18
            })
            .attr("fill", "#FFFFFF")
            .attr("font-weight", 'bold')

        var label = svg.selectAll("label")
            .data(this.myData)
            .enter()
            .append("text")
            .text(function(d) {
                return d.label
            })
            .attr("x", 10
            )
            .attr("y", function(d,i) {
                return (barWidth * i) + 18})
            .attr("fill", "#FFFFFF")
            .attr("font-weight", 'bold')

        var offset = svg.selectAll("offset")
            .data(this.myData)
            .enter()
            .append("text")
            .text(function(d) {
                var off = d.value - 200
                if (off < 0) {
                    return off
                } else {
                    return "+" + off
                }
            })
            .attr("x", function(d, i) {
                return (d.value * 4) + 5})
            .attr("y", function(d,i) {
                return (barWidth * i) + 18})
            .attr("fill", "#111111")
            .attr("font-weight", 'bold')

    }

    private goToTarget(i: number) {
        this.$router.push('ots-management');
    }

    private lessThanZero(val: number) {
        if (val < 0) { return true; } else { return false; }
    }

}
</script>
