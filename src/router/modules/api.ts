/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Component } from 'vue'
import utils from '@/utils'
const IFrame = () => import('@/views/iframe/index.vue');


// All TSX files under the views folder automatically generate mapping relationship
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)

export default {
    path: '/service',
    name: 'service',
    meta: { title: 'service' },
    redirect: { name: 'api-dev' },
    component: () => import('@/layouts/content'),
    children: [
        {
            path: '/service/api-dev',
            name: 'api-dev',
            component: () => import('@/views/api/api-dev/list/index.vue'),
            meta: {
                title: '服务开发-api-dev',
                activeMenu: 'service',
                showSide: true,
                auth: []
            }
        },
        {
            path: '/service/api-dev-step',
            name: 'api-dev-step',
            component: () => import('@/views/api/api-dev/add/stepForm.vue'),
            meta: {
                title: '服务开发-api-dev-step',
                activeMenu: 'service',
                showSide: true,
                auth: []
            }
        },
        {
            path: '/service/api-register',
            name: 'api-register',
            component: () => import('@/views/api/api-dev/register/index.vue'),
            meta: {
                title: '服务注册-api-register',
                activeMenu: 'service',
                showSide: true,
                auth: []
            }
        },
        {
            path: '/service/api-manager',
            name: 'api-manager',
            component: () => import('@/views/api/api-manager/list/index.vue'),
            meta: {
                title: '服务开发-api-manager',
                activeMenu: 'service',
                showSide: true,
                auth: []
            }
        }
    ]
}
