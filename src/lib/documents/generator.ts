import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

export interface DocumentData {
    transactionId: string;
    carPrice: number;
    carDetails: {
        make: string;
        model: string;
        year: number;
        vin?: string;
        plates?: string;
        color?: string;
    };
    buyerName?: string;
    sellerName?: string;
    date: string;
}

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    title: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    subtitle: { fontSize: 8, marginBottom: 20, textAlign: 'center' },
    text: { fontSize: 10, marginBottom: 10, lineHeight: 1.5 },
    bold: { fontWeight: 'bold' },
    clause: { marginBottom: 15 },
    footer: { marginTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
    signatureLine: { borderTopWidth: 1, borderTopColor: '#000', width: 150, textAlign: 'center', paddingTop: 5 }
});

const ContractDoc = ({ data }: { data: DocumentData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO</Text>
            <Text style={styles.subtitle}>(MODELO BASADO EN LINEAMIENTOS PROFECO)</Text>
            
            <Text style={styles.text}>
                Contrato de compraventa que celebran por una parte el VENDEDOR, y por otra parte el COMPRADOR, respecto del vehículo marca {data.carDetails.make}, modelo {data.carDetails.model}, año {data.carDetails.year}, con número de serie (VIN) {data.carDetails.vin || "N/A"} y placas {data.carDetails.plates || "N/A"}.
            </Text>

            <View style={{ marginTop: 20 }}>
                <Text style={[styles.text, styles.bold]}>CLÁUSULAS</Text>
                <View style={styles.clause}>
                    <Text style={styles.text}>PRIMERA. El objeto del presente contrato es la compraventa del vehículo antes descrito, el cual se entrega en el estado mecánico y de carrocería que el COMPRADOR conoce y acepta.</Text>
                </View>
                <View style={styles.clause}>
                    <Text style={styles.text}>SEGUNDA. El precio pactado por la unidad es de ${data.carPrice.toLocaleString()} MXN, el cual ha sido liquidado mediante la Bóveda Digital de StarterKar bajo el folio {data.transactionId}.</Text>
                </View>
                <View style={styles.clause}>
                    <Text style={styles.text}>TERCERA. El VENDEDOR declara que el vehículo es de su propiedad y se encuentra libre de todo gravamen o responsabilidad legal.</Text>
                </View>
                <View style={styles.clause}>
                    <Text style={styles.text}>CUARTA. El VENDEDOR se obliga a hacer entrega de la documentación original que ampara la propiedad del vehículo (Factura, Tenencias, Verificaciones).</Text>
                </View>
                <View style={styles.clause}>
                    <Text style={styles.text}>QUINTA. Las partes aceptan que para cualquier controversia se someterán a la jurisdicción de los tribunales competentes de la Ciudad de México y a la Procuraduría Federal del Consumidor (PROFECO).</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View>
                    <View style={styles.signatureLine}><Text style={styles.text}>EL VENDEDOR</Text></View>
                </View>
                <View>
                    <View style={styles.signatureLine}><Text style={styles.text}>EL COMPRADOR</Text></View>
                </View>
            </View>
        </Page>
    </Document>
);

const ResponsivaDoc = ({ data }: { data: DocumentData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>CARTA RESPONSIVA DE COMPRAVENTA</Text>
            
            <Text style={styles.text}>
                En la fecha {data.date}, se hace entrega física del vehículo {data.carDetails.make} {data.carDetails.model} {data.carDetails.year} con placas {data.carDetails.plates || "N/A"}.
            </Text>
            
            <Text style={styles.text}>
                A partir de la firma de la presente y la entrega de las llaves, el COMPRADOR asume toda la responsabilidad civil, penal y administrativa que se derive del uso, manejo y posesión de la unidad antes descrita.
            </Text>

            <Text style={styles.text}>
                El VENDEDOR se deslinda de cualquier incidente, infracción o mal uso que se le dé al vehículo posterior a este acto.
            </Text>

            <View style={{ marginTop: 40 }}>
                <Text style={styles.text}>Folio de Transacción: {data.transactionId}</Text>
                <Text style={styles.text}>Monto de Operación: ${data.carPrice.toLocaleString()} MXN</Text>
            </View>

            <View style={{ marginTop: 60, alignItems: 'center' }}>
                <View style={styles.signatureLine}><Text style={styles.text}>FIRMA DE CONFORMIDAD</Text></View>
            </View>
        </Page>
    </Document>
);

export async function generateContractPDF(data: DocumentData) {
    return await renderToBuffer(<ContractDoc data={data} />);
}

export async function generateResponsivaPDF(data: DocumentData) {
    return await renderToBuffer(<ResponsivaDoc data={data} />);
}

export async function generateCertificatePDF(data: DocumentData) {
    // Basic placeholder for certificate using same logic
    return await renderToBuffer(
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>CERTIFICADO STARTERKAR</Text>
                <Text style={styles.text}>Vehículo: {data.carDetails.make} {data.carDetails.model} {data.carDetails.year}</Text>
                <Text style={styles.text}>Este auto ha superado satisfactoriamente los 150 puntos de control.</Text>
            </Page>
        </Document>
    );
}
