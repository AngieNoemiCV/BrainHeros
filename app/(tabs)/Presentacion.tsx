import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen: React.FC = () => {
    const navigation = useNavigation();

    const navigateToNextScreen = () => {
        navigation.navigate('index'); // Aquí navegas a la pantalla de inicio de sesión
    };

    return (
        <View style={styles.container}>
            {/* Logo de la aplicación */}
            <Image source={require('@/assets/images/brainHerosLogo.png')} style={styles.logo} />

            {/* Botón para continuar */}
            <TouchableOpacity style={styles.button} onPress={navigateToNextScreen}>
                <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#27613C', // El color de fondo que prefieras
    },
    logo: {
        width: 200,  // Ajusta el tamaño según tu logo
        height: 200,
        marginBottom: 50,
    },
    button: {
        backgroundColor: '#4CAF50', // Color del botón
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
