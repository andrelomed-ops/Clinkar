"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts if needed (using standard ones for now to avoid issues)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        paddingBottom: 20,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    brandName: {
        fontSize: 20,
        fontWeight: 'black',
        letterSpacing: -1,
        color: '#000000',
    },
    reportMeta: {
        textAlign: 'right',
    },
    metaText: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
    },
    assetInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        backgroundColor: '#fafafa',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
    },
    infoItem: {
        width: '30%',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 8,
        color: '#999999',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    scoreSection: {
        alignItems: 'center',
        marginVertical: 40,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        borderColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    sealText: {
        fontSize: 12,
        color: '#4f46e5',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#f1f1f1',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 8,
        color: '#999999',
    }
});

interface PDFReportProps {
    assetData: {
        name: string;
        brand: string;
        model: string;
        year: string;
        type: string;
        mileage_hours: string;
        inspector_name: string;
        date: string;
    };
    score: number;
    partnerInfo?: {
        name: string;
        logo?: string;
    };
}

export const DynamicPDFReport = ({ assetData, score, partnerInfo }: PDFReportProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <Text style={styles.brandName}>Clinkar</Text>
                    {partnerInfo?.name && (
                        <>
                            <Text style={{ fontSize: 18, color: '#cccccc' }}>|</Text>
                            <Text style={{ fontSize: 14, color: '#666666' }}>{partnerInfo.name}</Text>
                        </>
                    )}
                </View>
                <View style={styles.reportMeta}>
                    <Text style={styles.metaText}>CERTIFICADO DE INSPECCIÓN</Text>
                    <Text style={[styles.metaText, { fontWeight: 'bold' }]}>#{Math.random().toString(36).substring(7).toUpperCase()}</Text>
                    <Text style={styles.metaText}>{assetData.date}</Text>
                </View>
            </View>

            {/* Asset Overview */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detalles del Activo</Text>
                <View style={styles.assetInfoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Marca / Modelo</Text>
                        <Text style={styles.infoValue}>{assetData.name}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Año</Text>
                        <Text style={styles.infoValue}>{assetData.year}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Uso ({assetData.type === 'Automotriz' ? 'Km' : 'Hrs'})</Text>
                        <Text style={styles.infoValue}>{assetData.mileage_hours}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Categoría</Text>
                        <Text style={styles.infoValue}>{assetData.type}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Inspector</Text>
                        <Text style={styles.infoValue}>{assetData.inspector_name}</Text>
                    </View>
                </View>
            </View>

            {/* Score Section */}
            <View style={styles.scoreSection}>
                <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>{score}%</Text>
                </View>
                <Text style={styles.sealText}>Sello de Confianza Clinkar Otorgado</Text>
                <Text style={{ fontSize: 10, color: '#666666', marginTop: 10, textAlign: 'center', width: 250 }}>
                    Este activo ha superado satisfactoriamente los 150 puntos de control técnico y legal.
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Generado de forma segura via Clinkar Enterprise</Text>
                <Text style={styles.footerText}>Página 1 de 1</Text>
            </View>
        </Page>
    </Document>
);
