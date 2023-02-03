import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// 설치했던 아이콘 파일에서 원하는 아이콘 불러오기
import {
    faAngleLeft,
    faAngleRight,
    faLocationDot,
    faTimes,
    faPlus,
    faXmark
} from "@fortawesome/free-solid-svg-icons"


// 불러온 아이콘을 라이브러리에 담기
library.add(faAngleLeft);
library.add(faAngleRight);
library.add(faLocationDot);
library.add(faTimes);
library.add(faPlus);
library.add(faXmark);


// fontawesome 아이콘을 Vue템플릿에서 사용할 수 있도록 등록
Vue.component("FontAwesomeIcon", FontAwesomeIcon);


