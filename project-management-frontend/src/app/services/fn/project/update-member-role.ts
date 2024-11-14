/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AssignRoleRequest } from '../../models/assign-role-request';

export interface UpdateMemberRole$Params {
  projectId: number;
      body: AssignRoleRequest
}

export function updateMemberRole(http: HttpClient, rootUrl: string, params: UpdateMemberRole$Params, context?: HttpContext): Observable<StrictHttpResponse<string>> {
  const rb = new RequestBuilder(rootUrl, updateMemberRole.PATH, 'put');
  if (params) {
    rb.path('projectId', params.projectId, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'text', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<string>;
    })
  );
}

updateMemberRole.PATH = '/api/projects/{projectId}/update-role';
