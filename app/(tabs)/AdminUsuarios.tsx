import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { supabase } from '@/database/supabaseAdmin.js'; // Tu cliente de Supabase
import { useNavigation } from 'expo-router';

export default function AdministrarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editProgresoVisible, setEditProgresoVisible] = useState(false);

    const [editedNombre, setEditedNombre] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [progressData, setProgressData] = useState([]);

    const [Uid, setUid] = useState('');

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        setLoading(true);
    
        try {
            // Obtener el usuario logueado
            const { data: loggedInUser, error: userError } = await supabase.auth.getUser();
    
            if (userError) {
                console.error('Error :', userError);
                Alert.alert('Error al cargar el usuario logueado.');
                setLoading(false);
                return;
            }
    
            const loggedInEmail = loggedInUser?.user?.email;
    
            if (!loggedInEmail) {
                console.error('Error: email no econtrado');
                Alert.alert('No se encontró el email del usuario logueado.');
                setLoading(false);
                return;
            }
    
            // Obtener todos los usuarios excepto el logueado
            const { data, error } = await supabase
                .from('usuario')
                .select('email, name, is_admin, ProgressTable(level_number, completed)')
                .neq('email', loggedInEmail); // Filtrar por email
    
            if (error) {
                console.error('Error fetching users:', error);
                Alert.alert('Error al cargar los usuarios.');
            } else {
                setUsuarios(data);
            }
        } catch (error) {
            console.error('Error en fetchUsuarios:', error);
            Alert.alert('Ocurrió un error al cargar los usuarios.');
        }
    
        setLoading(false);
    };

    const openEditModal = (usuario) => {
        setSelectedUsuario(usuario);
        setEditedNombre(usuario.name);
        setEditedEmail(usuario.email);
        setEditModalVisible(true);
    };

    const saveUserChanges = async () => {
        try {
            const { error } = await supabase
                .from('usuario')
                .update({ name: editedNombre, email: editedEmail })
                .eq('email', selectedUsuario.email);

            if (error) throw error;

            Alert.alert('Usuario actualizado con éxito.');
            setEditModalVisible(false);
            fetchUsuarios();
        } catch (error) {
            Alert.alert('Error al actualizar el usuario.');
            console.error('Error update users:', error);
            console.error('Error update users:', selectedUsuario);
            setEditModalVisible(false);
        }
    };

    const openProgressModal = (usuario) => {
        setSelectedUsuario(usuario);
        setProgressData(usuario.ProgressTable || []);
        setEditProgresoVisible(true);
    };

    const saveProgressChanges = async () => {
        try {
            for (const progress of progressData) {
                await supabase
                    .from('ProgressTable')
                    .update({ completed: progress.completed })
                    .eq('level_number', progress.level_number)
                    .eq('email', selectedUsuario.email);
            }

            Alert.alert('Progreso actualizado con éxito.');
            setEditProgresoVisible(false);
            fetchUsuarios();
        } catch (error) {
            Alert.alert('Error al actualizar el progreso.');
        }
    };

    const updateProgressValue = (index, value) => {
        const updatedProgress = [...progressData];
        updatedProgress[index].completed = value;
        setProgressData(updatedProgress);
    };

    const toggleAdminRole = async (email, currentRole) => {
        const confirm = await new Promise((resolve) => {
            Alert.alert(
                'Confirmar acción',
                `¿Estás seguro de ${currentRole ? 'degradar' : 'promover'} este usuario?`,
                [
                    { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Confirmar', onPress: () => resolve(true) },
                ]
            );
        });

        if (!confirm) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .from('usuario')
                .update({ is_admin: !currentRole })
                .eq('email', email);

            if (error) throw error;

            Alert.alert(`Usuario ${currentRole ? 'degradado' : 'promovido'} con éxito.`);
            fetchUsuarios(); // Actualizar la lista
        } catch (error) {
            console.error('Error al cambiar el rol del usuario:', error);
            Alert.alert('Error al cambiar el rol del usuario.');
        }

        setLoading(false);
    };

    const eliminarUsuario = async (email) => {
        fetchUsuarios(); // Actualizar la lista

        const confirm = await new Promise((resolve) => {
            Alert.alert(
                'Confirmar eliminación',
                `¿Estás seguro de eliminar el usuario ${email}?`,
                [
                    { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
                    { text: 'Eliminar', onPress: () => resolve(true) },
                ]
            );
        });

        if (!confirm) return;

        setLoading(true);


        try {
            const { error: deleteProgressError } = await supabase
                .from('ProgressTable')
                .delete()
                .eq('email', email);

            if (deleteProgressError) throw deleteProgressError;

            const { error: deleteUserError } = await supabase
                .from('usuario')
                .delete()
                .eq('email', email);

            if (deleteUserError) throw deleteUserError;

            const { data: user, error } = await supabase.auth.admin.listUsers();
            if (error) throw error;

            const filteredUser = user.users.find(user => user.email === email);

            if (!filteredUser) {
                console.log('No se encontró un usuario con ese correo.');
                return null;
            }

            // Acceder al ID del usuario        
            const userId = filteredUser.id;
            console.log('ID del usuario encontrado:', userId);

            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            if (authError) throw authError;

            Alert.alert('Usuario eliminado con éxito.');
            fetchUsuarios(); // Actualizar la lista
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            Alert.alert('Error al eliminar el usuario.');
        }

        setLoading(false);
    };

    const navigation = useNavigation();


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Administrar Usuarios</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Administrador')}        
                // onPress={() => eliminarUsuario('hola2@gmail.com')}
            >
                <Text style={styles.buttonText}>Regresar</Text>
            </TouchableOpacity>

            {loading ? (
                <Text style={styles.loading}>Cargando...</Text>
            ) : (
                <FlatList
                    data={usuarios}
                    keyExtractor={(item) => item.email}
                    renderItem={({ item }) => (
                        <View style={styles.userCard}>
                            <Text style={styles.userEmail}>{item.email}</Text>
                            <Text style={styles.userName}>{item.name}</Text>
                            <Text style={styles.userRole}>
                                Rol: {item.is_admin ? 'Administrador' : 'Usuario'}
                            </Text>

                            {item.ProgressTable.map((progress, index) => (
                                <Text key={index} style={styles.userProgress}>
                                    Nivel: {progress.level_number} - Completado: {progress.completed ? 'Sí' : 'No'}
                                </Text>
                            ))}

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => openEditModal(item)}
                                >
                                    <Text style={styles.buttonText}>Editar Usuario</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => openProgressModal(item)}
                                >
                                    <Text style={styles.buttonText}>Editar Progreso</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.roleButton]}
                                    onPress={() => toggleAdminRole(item.email, item.is_admin)}
                                >
                                    <Text style={styles.buttonText}>
                                        {item.is_admin ? 'Degradar a Usuario' : 'Promover a Admin'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.deleteButton]}
                                    onPress={() => eliminarUsuario(item.email)}
                                >
                                    <Text style={styles.buttonText}>Eliminar Usuario</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal para editar usuario */}
            {selectedUsuario && (
                <Modal visible={editModalVisible} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={styles.alertContainer}>
                            <Text style={styles.alertTitle}>Editar Usuario</Text>
                            <TextInput
                                style={styles.input}
                                value={editedNombre}
                                onChangeText={setEditedNombre}
                                placeholder="Nombre"
                            />
                            <TextInput
                                style={styles.input}
                                value={editedEmail}
                                onChangeText={setEditedEmail}
                                placeholder="Correo Electrónico"
                                editable= {false}
                            />
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setEditModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={saveUserChanges}>
                                    <Text style={styles.confirmButtonText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Modal para editar progreso */}
            {selectedUsuario && (
                <Modal visible={editProgresoVisible} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={styles.alertContainer}>
                            <Text style={styles.alertTitle}>Editar Progreso</Text>
                            {progressData.map((progress, index) => (
                                <View key={index} style={styles.progressItem}>
                                    <Text style={styles.progressText}>Nivel {progress.level_number}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.progressButton,
                                            progress.completed ? styles.completed : styles.notCompleted,
                                        ]}
                                        onPress={() => updateProgressValue(index, !progress.completed)}>
                                        <Text style={styles.buttonText}>
                                            {progress.completed ? 'Completado' : 'Incompleto'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setEditProgresoVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={saveProgressChanges}>
                                    <Text style={styles.confirmButtonText}>Guardar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        top: 50,
        alignItems: 'center',

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    loading: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 20,
    },
    userCard: {
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    userEmail: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 16,
        color: '#555',
    },
    userRole: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    userProgress: {
        fontSize: 14,
        color: '#777',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 10,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        marginRight: 10,
        width: '45%',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    deleteButton: {
        backgroundColor: '#E53935',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        justifyContent: 'center',

    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,.5)',
        padding: 20,
    },
    // progressItem: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     marginBottom: 15,
    // },
    completed: { backgroundColor: '#4CAF50' },
    notCompleted: { backgroundColor: '#E53935' },

    // Agregados


    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo translúcido oscuro
    },
    alertContainer: {
        width: '90%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    alertTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    cancelButton: {
        backgroundColor: '#f44336',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    progressItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    progressButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
});