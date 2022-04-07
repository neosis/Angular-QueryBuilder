import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { QueryArrowIconDirective } from './query-builder/query-arrow-icon.directive';
import { QueryFieldDirective } from './query-builder/query-field.directive';
import { QueryInputDirective } from './query-builder/query-input.directive';
import { QueryEntityDirective } from './query-builder/query-entity.directive';
import { QueryOperatorDirective } from './query-builder/query-operator.directive';
import { QueryButtonGroupDirective } from './query-builder/query-button-group.directive';
import { QuerySwitchGroupDirective } from './query-builder/query-switch-group.directive';
import { QueryRemoveButtonDirective } from './query-builder/query-remove-button.directive';
import { QueryEmptyWarningDirective } from './query-builder/query-empty-warning.directive';
export class QueryBuilderModule {
}
QueryBuilderModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    FormsModule
                ],
                declarations: [
                    QueryBuilderComponent,
                    QueryInputDirective,
                    QueryOperatorDirective,
                    QueryFieldDirective,
                    QueryEntityDirective,
                    QueryButtonGroupDirective,
                    QuerySwitchGroupDirective,
                    QueryRemoveButtonDirective,
                    QueryEmptyWarningDirective,
                    QueryArrowIconDirective
                ],
                exports: [
                    QueryBuilderComponent,
                    QueryInputDirective,
                    QueryOperatorDirective,
                    QueryFieldDirective,
                    QueryEntityDirective,
                    QueryButtonGroupDirective,
                    QuerySwitchGroupDirective,
                    QueryRemoveButtonDirective,
                    QueryEmptyWarningDirective,
                    QueryArrowIconDirective
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjItcXVlcnktYnVpbGRlci5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL25lb3Npcy9wcm9qZWN0cy9Bbmd1bGFyLVF1ZXJ5QnVpbGRlci9wcm9qZWN0cy9hbmd1bGFyMi1xdWVyeS1idWlsZGVyL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hbmd1bGFyMi1xdWVyeS1idWlsZGVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxHQUFHLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFFaEYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDbEYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDekYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDekYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDM0YsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFnQzNGLE1BQU0sT0FBTyxrQkFBa0I7OztZQTlCOUIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxZQUFZO29CQUNaLFdBQVc7aUJBQ1o7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLHFCQUFxQjtvQkFDckIsbUJBQW1CO29CQUNuQixzQkFBc0I7b0JBQ3RCLG1CQUFtQjtvQkFDbkIsb0JBQW9CO29CQUNwQix5QkFBeUI7b0JBQ3pCLHlCQUF5QjtvQkFDekIsMEJBQTBCO29CQUMxQiwwQkFBMEI7b0JBQzFCLHVCQUF1QjtpQkFDeEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLHFCQUFxQjtvQkFDckIsbUJBQW1CO29CQUNuQixzQkFBc0I7b0JBQ3RCLG1CQUFtQjtvQkFDbkIsb0JBQW9CO29CQUNwQix5QkFBeUI7b0JBQ3pCLHlCQUF5QjtvQkFDekIsMEJBQTBCO29CQUMxQiwwQkFBMEI7b0JBQzFCLHVCQUF1QjtpQkFDeEI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBRdWVyeUJ1aWxkZXJDb21wb25lbnQgfSBmcm9tICcuL3F1ZXJ5LWJ1aWxkZXIvcXVlcnktYnVpbGRlci5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBRdWVyeUFycm93SWNvbkRpcmVjdGl2ZSB9IGZyb20gJy4vcXVlcnktYnVpbGRlci9xdWVyeS1hcnJvdy1pY29uLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeUZpZWxkRGlyZWN0aXZlIH0gZnJvbSAnLi9xdWVyeS1idWlsZGVyL3F1ZXJ5LWZpZWxkLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeUlucHV0RGlyZWN0aXZlIH0gZnJvbSAnLi9xdWVyeS1idWlsZGVyL3F1ZXJ5LWlucHV0LmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeUVudGl0eURpcmVjdGl2ZSB9IGZyb20gJy4vcXVlcnktYnVpbGRlci9xdWVyeS1lbnRpdHkuZGlyZWN0aXZlJztcbmltcG9ydCB7IFF1ZXJ5T3BlcmF0b3JEaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWJ1aWxkZXIvcXVlcnktb3BlcmF0b3IuZGlyZWN0aXZlJztcbmltcG9ydCB7IFF1ZXJ5QnV0dG9uR3JvdXBEaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWJ1aWxkZXIvcXVlcnktYnV0dG9uLWdyb3VwLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBRdWVyeVN3aXRjaEdyb3VwRGlyZWN0aXZlIH0gZnJvbSAnLi9xdWVyeS1idWlsZGVyL3F1ZXJ5LXN3aXRjaC1ncm91cC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUXVlcnlSZW1vdmVCdXR0b25EaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWJ1aWxkZXIvcXVlcnktcmVtb3ZlLWJ1dHRvbi5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgUXVlcnlFbXB0eVdhcm5pbmdEaXJlY3RpdmUgfSBmcm9tICcuL3F1ZXJ5LWJ1aWxkZXIvcXVlcnktZW1wdHktd2FybmluZy5kaXJlY3RpdmUnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIEZvcm1zTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFF1ZXJ5QnVpbGRlckNvbXBvbmVudCxcbiAgICBRdWVyeUlucHV0RGlyZWN0aXZlLFxuICAgIFF1ZXJ5T3BlcmF0b3JEaXJlY3RpdmUsXG4gICAgUXVlcnlGaWVsZERpcmVjdGl2ZSxcbiAgICBRdWVyeUVudGl0eURpcmVjdGl2ZSxcbiAgICBRdWVyeUJ1dHRvbkdyb3VwRGlyZWN0aXZlLFxuICAgIFF1ZXJ5U3dpdGNoR3JvdXBEaXJlY3RpdmUsXG4gICAgUXVlcnlSZW1vdmVCdXR0b25EaXJlY3RpdmUsXG4gICAgUXVlcnlFbXB0eVdhcm5pbmdEaXJlY3RpdmUsXG4gICAgUXVlcnlBcnJvd0ljb25EaXJlY3RpdmVcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFF1ZXJ5QnVpbGRlckNvbXBvbmVudCxcbiAgICBRdWVyeUlucHV0RGlyZWN0aXZlLFxuICAgIFF1ZXJ5T3BlcmF0b3JEaXJlY3RpdmUsXG4gICAgUXVlcnlGaWVsZERpcmVjdGl2ZSxcbiAgICBRdWVyeUVudGl0eURpcmVjdGl2ZSxcbiAgICBRdWVyeUJ1dHRvbkdyb3VwRGlyZWN0aXZlLFxuICAgIFF1ZXJ5U3dpdGNoR3JvdXBEaXJlY3RpdmUsXG4gICAgUXVlcnlSZW1vdmVCdXR0b25EaXJlY3RpdmUsXG4gICAgUXVlcnlFbXB0eVdhcm5pbmdEaXJlY3RpdmUsXG4gICAgUXVlcnlBcnJvd0ljb25EaXJlY3RpdmVcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBRdWVyeUJ1aWxkZXJNb2R1bGUgeyB9XG4iXX0=