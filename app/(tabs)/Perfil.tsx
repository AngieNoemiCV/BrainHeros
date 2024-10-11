// Perfil.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase

export default function Perfil() {
    const navigation = useNavigation();


    // Función para cerrar sesión (opcional)
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigation.navigate('index'); // Redirigir al login al cerrar sesión
        }
        else{
            console.log("op")
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil del Usuario</Text>
            {/* Aquí puedes agregar la información del perfil, como el nombre del usuario, su foto, etc. */}
            <Text style={styles.info}>Nombre: Usuario Ejemplo</Text>
            <Text style={styles.info}>Email: usuario@ejemplo.com</Text>

            {/* Botón para navegar a otra pantalla si es necesario */}
            <Button
                title="Editar Perfil"
                onPress={() => {
                    // Lógica para editar perfil
                }}
            />

            <Button
                title="Cerrar Sesión"
                onPress={() => {
                    handleLogout(); 
                }}
                color="red"
            />

            <Button
                title="En caso de ser el Admin"
                onPress={() => {
                    // Lógica para editar perfil
                    navigation.navigate('LoginPatron')
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    info: {
        fontSize: 18,
        marginBottom: 10,
    },
});
