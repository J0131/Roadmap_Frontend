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
import {fromLonLat, toLonLat, transform} from 'ol/proj.js';
import {defaults} from 'ol/control.js';
import eventBus from '../utils/eventBus'
import Geocoder from 'ol-geocoder'
import OlVectorSource from 'ol/source/Vector.js'
import OlVectorLayer from 'ol/layer/Vector.js'
import OlFeature from 'ol/Feature.js';
import OlPoint from 'ol/geom/Point';
import OlStyle from 'ol/style/Style.js'
import OlIcon from 'ol/style/Icon.js'
import Overlay from 'ol/Overlay';

const EPSG_3857 = 'EPSG:3857';
const EPSG_4326 = 'EPSG:4326'
//import eventBus from '../main.js';

export default {
    name : 'MainMap',
    data() {
        return {
            isShowOverlay: false,
            olMap: undefined,
            address: undefined,
            selectedOverlayText: undefined,
            selectedOverlayRating: undefined,
            overlay: undefined,
            vectorSource: undefined,
            iconsSource: undefined
        }
    },
    computed: {
        reviews() {
            return this.$store.state.reviews
        },
        isDisabledInput() {
            return this.$store.state.isDisabledInput
        }
    },
    watch: {
        async reviews() {
            if (this.vectorSource)
                this.vectorSource.clear();
            this.drawFeatures();
        }
    },
    async mounted() {
        const that = this

        this.vectorSource = new OlVectorSource(EPSG_3857);
        const vectorLayer = new OlVectorLayer({
            source: this.vectorSource
        })

        this.olMap = new OlMap({            
            target: this.$refs.map,
            controls: defaults({
                attribution: false,
                zoom: false,
                rotate: false,
            }),
            layers: [
                new OlLayerTile({
                    source: new OSM()
                }),
                vectorLayer
            ],
            view: new OlView({
                center: this.coordi4326To3857([127.1388684, 37.4449168]),
                zoom: 10,
                projection: EPSG_3857 // 생략 가능
            })
        });

        await this.$store.dispatch('setReviews');

        this.drawFeatures()

        this.olMap.on('pointermove', (e) => {
            that.olMap.getTargetElement().style.cursor = ''
            that.isShowOverlay = false
            that.olMap.removeOverlay(that.overlay)

            that.olMap.forEachFeatureAtPixel(e.pixel, feature => {
                if(feature.getGeometry().getType() === 'Point' && 
                    feature.get('title') !== undefined ) {
                        that.isShowOverlay = true
                        that.selectedOverlayText = feature.get('title')
                        that.selectedOverlayRating = feature.get('grade')

                        const overlay = that.$refs.overlay

                        that.overlay = new Overlay({
                            element: overlay,
                            position: feature.getGeometry().getCoordinates(),
                            positioning: 'bottom-center',
                            stopEvent: false,
                            offset: [0, -10]
                        })
                        that.olMap.addOverlay(that.overlay)
                        that.olMap.getTargetElement().style.cursor = 'pointer'
                    }
            })
        })

        this.olMap.on('click', async (e) => {

            this.vectorSource.clear()
            geocoder.getSource().clear()

            const lonLatArr = toLonLat(e.coordinate)
            const lon = lonLatArr[0]
            const lat = lonLatArr[1]

            const addressinfo = await that.getAddress(lon, lat)

            this.$store.commit('setReview', undefined)
            this.$store.commit('setInputState', false)
            this.$store.commit('setCurAddress', addressinfo)
            this.$store.commit('setLonLat', {lon, lat});

            const point = that.coordi4326To3857([lon, lat])
            const feature = new OlFeature({
                geometry: new OlPoint(point)
            })
            feature.setStyle(new OlStyle({
                image: new OlIcon({
                    scale: 0.8,
                    src: '//cdn.rawgit.com/jonataswalker/map-utils/master/images/marker.png'              
                })
            }))

            const existFeature = that.olMap.forEachFeatureAtPixel(e.pixel, feature => {
                this.$store.commit('setCurTitle', feature.get('title'))
                this.$store.commit('setCurAddress', feature.get('address'))
                this.$store.commit('setCurGrade', feature.get('grade'))
                this.$store.commit('setCurReview', feature.get('review'))
                this.$store.commit('setCurReviewId', feature.get('reviewId'))
                this.$store.commit('setInputState', true)
                return true
            })

            if(!existFeature)
                this.vectorSource.addFeature(feature);

            //drawMapIcon(e)
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
        // olMap에 geocoder를 추가해준다
        // addcontrol은 openlayers에서 제공하는 메소드로, 커스텀 컨트롤을 주입하게해줌

        geocoder.on('addresschosen', function(evt) {
            console.log(evt.address.details.name)
            this.vectorSource.clear()
            that.$store.commit('setCurAddress',that.setUiAddress(evt.address.details.name))
        })
    },
    methods: {
        drawFeatures(){
            if (this.iconsSource)
                this.iconsSource.clear();

            this.iconsSource = new OlVectorSource(EPSG_3857);
            const iconsLayer = new OlVectorLayer({
                source: this.iconsSource
            });

            const style = new OlStyle({
                image: new OlIcon({
                    scale: 0.06,
                    src: require('../assets/images/spot.png')
                })
            });

            const features = this.reviews.map(review => {
                const point = this.coordi4326To3857([review.lon, review.lat]);
                const feature = new OlFeature({
                    geometry: new OlPoint(point)
                });
                feature.set('title', review.title);
                feature.set('grade', review.grade);
                feature.set('address', review.address);
                feature.set('review', review.review);
                feature.set('reviewId', review.id);
                feature.setStyle(style);

                return feature;
            })

            this.iconsSource.addFeatures(features);

            this.olMap.addLayer(iconsLayer);
        },
        async getReviews() {
            return await process(this, async() => {

            })
        },

        coordi4326To3857(coord) {
            return transform(coord, EPSG_4326, EPSG_3857);
        },
        
        async getAddress (lon, lat) {
            return await axios.get(
                'https://nominatim.openstreetmap.org/reverse',
                {
                    params: {
                        format: 'json',
                        lon: lon,
                        lat: lat
                    }
                }).then((response)=>{
                    this.$store.state.curLon = lon
                    this.$store.state.curLat = lat
                    const address = response.data.display_name.split(", ").reverse().join(" ")
                    console.log("axios success // " + typeof(response))
                    eventBus.$emit('clickMap',address)
                    return address
                }).catch((err)=> {
                    console.log("axios error" + err)
                })
        },
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

<style lang="scss">
.ol-geocoder {
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
</style>