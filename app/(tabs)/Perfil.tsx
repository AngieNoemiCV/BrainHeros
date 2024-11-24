import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase

export default function Perfil() {
    const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario

    useFocusEffect(
        useCallback(() => {
            fetchUsuario();
            checkSession();
        }, []),
    );

    // Obtener los detalles del usuario logueado y su progreso
    useEffect(() => {
        checkSession();
        fetchUsuario();
    }, []);

    const fetchUsuario = async () => {
        // Paso 1: Obtener la sesión del usuario logueado de forma asincrónica
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Error al obtener la sesión:', sessionError.message);
            return;
        }
        const user = session?.session?.user;
        if (user) {
            // Paso 2: Consultar la tabla Usuario para obtener el nombre
            const { data: userData, error: userError } = await supabase
                .from('usuario')
                .select('name, is_admin')
                .eq('email', user.email)
                .single(); // Usamos single ya que solo esperamos un único resultado
            if (userError) {
                console.error('Error al obtener el nombre del usuario:', userError.message);
                return;
            }
            setUsuario({ email: user.email, name: userData?.name, is_admin: userData?.is_admin});
        }
    };
    // fetchUsuario();

    const navigation = useNavigation();

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
            // console.log(session)
            if (!session) {
                navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
            }
        } catch {
            navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
            return;
        }
    };

    // Función para cerrar sesión (opcional)
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            navigation.navigate('index'); // Redirigir al login al cerrar sesión
        }
        else {
            navigation.navigate('index'); // Redirigir al login al cerrar sesión
        }
    };

    //Funcion para usar si eres admin
    const handleAdminNavigation = () => {
        if (usuario?.is_admin) {
          navigation.navigate('Administrador');
        } else {
          alert('No tienes permisos para acceder a esta pantalla ' + usuario.name);
        }
      };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil del Usuario</Text>
            <View style={styles.userInfoContainer}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{usuario?.name}</Text>
            </View>
            <View style={styles.userInfoContainer}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{usuario?.email}</Text>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.adminButton}
                onPress={handleAdminNavigation}
            >
                <Text style={styles.adminButtonText}>En caso de ser el Admin</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#27613C',
        marginBottom: 30,
    },
    userInfoContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    infoLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    infoValue: {
        fontSize: 18,
        color: '#555',
    },
    logoutButton: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 40,
    },
    logoutButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    adminButton: {
        backgroundColor: '#1D3D47',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
    },
    adminButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
