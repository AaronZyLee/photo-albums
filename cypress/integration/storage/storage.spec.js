import { login, uploadFile, downloadFile } from "../../test-utils/cypress-tasks";

describe('Storage test:', () => {

    beforeEach(() => {
        cy.visit('/');
        login();

        cy.server();
        cy.route('PUT', '**/*/test').as('upload');
    });

    describe('Upload and Download', () => {
        it('should upload a public image file to S3', () =>{

            cy.get('select').select('public').should('have.value', 'public');
            uploadFile();
        });

        it('should download an uploaded public file from S3', () => {
            cy.get('select').select('public').should('have.value', 'public');
            downloadFile();
        });

        it('should upload a private file to S3', () =>{

            cy.get('select').select('private').should('have.value', 'private');
            uploadFile();
        });

        it('should download an uploaded private file from S3', () => {
            cy.get('select').select('private').should('have.value', 'private');
            downloadFile();
        });

        it('should upload a protected file to S3', () =>{

            cy.get('select').select('protected').should('have.value', 'protected');
            uploadFile();
        });

        it('should download an uploaded protected file from S3', () => {
            cy.get('select').select('protected').should('have.value', 'protected');
            downloadFile();
        });

        it.skip('test', () => {
            cy.get('select').select('protected').should('have.value', 'protected');
            cy.get('[class="ui segment"]').find('img').should("be.visible");
        })
    });
});