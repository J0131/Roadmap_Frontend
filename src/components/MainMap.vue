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
import eventBus from '../utils/eventBus'
import Geocoder from 'ol-geocoder'
//import eventBus from '../main.js';

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

        const getaddress = (lon, lat) => {
            this.getAddress(lon,lat)
        }

        this.olMap.on('click', function(e) {
            console.log(e.coordinate)
            const lonLatArr = toLonLat(e.coordinate)
            const lon = lonLatArr[0]
            console.log(lon)
            const lat = lonLatArr[1]
            console.log(lat)
            getaddress(lon, lat)
        })

        // nominatim : 이름
        // osm : 자료이름

        const geocoder = new Geocoder('nominatim', {
            provider: 'osm',
            lang: 'kr',
            placeholder: '주소 검색',
            limit: 5, // 자동 완성 결과 최대 개수
            autoComplete: true,
            keepOpen: true
        })

        this.olMap.addControl(geocoder)
        // olMap에 geocoder를 추가해s준다
        // addcontrol은 openlayers에서 제공하는 메소드로, 커스텀 컨트롤을 주입하게해줌

        geocoder.on('addresschosen', (evt) => {
            that.setUiAddress(evt.address.details.name)
        })
    },
    methods: {
        getAddress (lon, lat) {
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
        setUiAddress(str){
            this.$root.$refs.sideBar.address = str.split(', ').reverse().join(' ')
        }
    }
}
</script>

<style lang="scss" scoped>
.main-map {
    width: 100%;
    height: 100%;

    ::v-deep.ol-geocoder {
        position: absolute;
        right: 0;
        padding: 10px;

        button {
            display: none;
        }

        input::placeholder {
            color: white;
            opacity: 0.7;
        }

        input, ul {
            border-style: none;
            width: 200px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
            border-color: unset;
            padding: 0 5px;
            color: white;
        }

        ul {
            margin-top: 5px;
            padding: 0;
            list-style: none;

            li:hover {
                background-color: rgba(0, 0, 0, 0.3);
            }

            li {
                padding: 5px 10px;
                font-size: 13px;

                a {
                    text-decoration: none;

                    .gcd-road {
                        color: white;
                    }
                }
            }
        }
    }
}
</style>