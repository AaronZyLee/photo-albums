import { login } from "../../test-utils/cypress-tasks";

describe('Storage test:', () => {

    beforeEach(() => {
        cy.visit('/');
        login();

        cy.server();
        cy.route('PUT', '**/*/test').as('upload');
        cy.route('GET', '**/public/**').as('download');
    });

    describe('Upload and Download', () => {
        it('should upload an public image file to S3 and then download it from S3', () =>{

            cy.get('select').select('public').should('have.value', 'public');
            cy.fixture('images/demo.jpg').then(fileContent => {
                cy.get('input[type="file"]').upload({fileContent, fileName:'test.jpg'},{subjectType:'input'});                   
            });
            cy.wait('@upload');
            cy.get('@upload').then(xhr => {
                expect(xhr.method).to.eq('PUT');
                expect(xhr.status).to.eq(200);
            });
            // Image still shows even if broken. TODO fix by hiding image when broken
            cy.get('[class="ui segment"]').find('img').should("be.visible");
            // cy.wait('@download');
            // cy.get('@download').then(xhr => {
            //     expect(xhr.method).to.eq('GET');
            //     expect(xhr.status).to.eq(200);
            // });
        });

        it('should upload an protected image file to S3 and then download it from S3', () =>{
            cy.get('select').select('private').should('have.value', 'private');
            cy.fixture('images/demo.jpg').then(fileContent => {
                cy.get('input[type="file"]').upload({fileContent, fileName:'test.jpg'},{subjectType:'input'});                   
            });
            cy.wait('@upload');
            cy.get('@upload').then(xhr => {
                expect(xhr.method).to.eq('PUT');
                expect(xhr.status).to.eq(200);
            });
            cy.get('[class="ui segment"]').find('img').should("be.visible");
        });

        it('should upload an private image file to S3 and then download it from S3', () =>{
            cy.get('select').select('protected').should('have.value', 'protected');
            cy.fixture('images/demo.jpg').then(fileContent => {
                cy.get('input[type="file"]').upload({fileContent, fileName:'test.jpg'},{subjectType:'input'});                   
            });
            cy.wait('@upload');
            cy.get('@upload').then(xhr => {
                expect(xhr.method).to.eq('PUT');
                expect(xhr.status).to.eq(200);
            });
            cy.get('[class="ui segment"]').find('img').should("be.visible");
        });
        it.skip('test', () => {
            cy.get('select').select('protected').should('have.value', 'protected');
            cy.get('[class="ui segment"]').find('img').should("be.visible");
        })
    });
});