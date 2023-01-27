<template>
    <div class="main-map" ref="map">
    </div>
</template>


<script>
import axios from 'axios'
import OlLayerTile from 'ol/layer/Tile.js';
import OlView from 'ol/View.js';
import OlMap from 'ol/Map.js';
import OSM from 'ol/source/OSM';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import {defaults} from 'ol/control.js';
import eventBus from '../main.js'
import { add } from 'ol/coordinate';

export default {
    name : 'MainMap',
    data() {
        return {
            olMap: undefined,
            address: ""
        }
    },
    mounted() {
        this.olMap = new OlMap({
            target: this.$refs.map,
            controls:defaults({
                attribution: false,
                zoom:false,
                rotate:false,
            }),
            layers: [
                new OlLayerTile({
                    source: new OSM()
                })
            ],
            view: new OlView({
                center: fromLonLat([127.1388684, 37.4449168]),
                zoom: 11
            })
        })

       const getaddress = async (lon, lat) => {
            return await this.getAddress(lon,lat)
        }

        this.olMap.on('click', function(e) {
            console.log(e.coordinate)
            const lonLatArr = toLonLat(e.coordinate)
            const lon = lonLatArr[0]
            console.log(lon)
            const lat = lonLatArr[1]
            console.log(lat)
            getaddress(lon, lat)

            //const address = getaddress(lon,lat).data.display_name.split(", ").reverse().join(" ");
            //eventBus.$emit('clickMap',address)
        })

        //console.log(this.getAddress(127.1388684,37.4449168))
    },
    methods: {
        async getAddress (lon, lat) {
            axios.get(
                'https://nominatim.openstreetmap.org/reverse',
                {
                    params: {
                        format: 'json',
                        lon: lon,
                        lat: lat
                    }
                }).then((response)=>{
                    const address = response.data.display_name.split(", ").reverse().join(" ")
                    console.log("axios success // " + address)
                    eventBus.$emit('clickMap',address)
                }).catch((err)=> {
                    console.log("axios error" + err)
                })
        },
    }
}
</script>

<style scoped>
.main-map {
    width: 100%;
    height: 100%;
}
</style>