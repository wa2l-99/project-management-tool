/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { TaskResponse } from '../../models/task-response';

export interface FindAllTasksByProject$Params {
  projectId: number;
}

export function findAllTasksByProject(http: HttpClient, rootUrl: string, params: FindAllTasksByProject$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<TaskResponse>>> {
  const rb = new RequestBuilder(rootUrl, findAllTasksByProject.PATH, 'get');
  if (params) {
    rb.path('projectId', params.projectId, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<TaskResponse>>;
    })
  );
}

findAllTasksByProject.PATH = '/api/tasks/projectId={projectId}';
