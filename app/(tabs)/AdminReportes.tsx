import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/database/supabaseAdmin'; // Importar el cliente de Supabase
import { useFocusEffect } from 'expo-router';

export default function AdminDashboard() {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario
    const [usuariosList, setUsuariosList] = useState([]);


    const [topCorrect, setTopCorrect] = useState([]);
    const [topMistakes, setTopMistakes] = useState([]);

    const [totalDesafios, setTotalDesafios] = useState<number | null>(null);
    const [desafiosPorNivel, setDesafiosPorNivel] = useState<{ level: number; total: number }[]>([]);

    const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);


    // Obtener los detalles del usuario logueado y su progreso
    useFocusEffect(
        useCallback(() => {
            fetchUsuario();
            checkSession();
            fetchTopQuestions();
            fetchTotalDesafios();
            fetchDesafiosPorNivel();
            fetchTotalUsuarios();
        }, []),
    );

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
            if (!session) {
                navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
            }
        } catch {
            const { error } = await supabase.auth.signOut();
            if (!error) {
                navigation.navigate('index'); // Redirigir al login al cerrar sesión
            }
            navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
            return;
        }
    };

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
            setUsuario({ email: user.email, name: userData?.name, is_admin: userData?.is_admin });
            // console.log(session)

            if (usuario?.is_admin) {
                // console.log('hi')
                return
            }
            else {
                console.log('usuario no admin')
                // navigation.navigate('Panel'); // Navegar a la pantalla de inicio de sesión
            }
        }

    };

    const fetchTopQuestions = async () => {
        try {
            // Obtener el máximo de aciertos
            const { data: maxAciertos, error: maxAciertosError } = await supabase
                .rpc('max', { column_name: 'aciertos' });

            if (maxAciertosError) {
                console.error('Error al obtener el máximo de aciertos:', maxAciertosError);
                return;
            }

            const { data: maxEquivocaciones, error: maxEquivocacionesError } = await supabase
                .rpc('max', { column_name: 'equivocaciones' });

            if (maxEquivocacionesError) {
                console.error('Error al obtener el máximo de equivocaciones:', maxEquivocacionesError);
                return;
            }

            /////////////////////////////////
            // console.log(maxAciertos) 
            // console.log(maxEquivocaciones)
            /////////////////////////////////

            // Obtener preguntas con el mayor número de aciertos
            const { data: maxAciertosData, error: maxAciertosDataError } = await supabase
                .from('QuestionsTable')
                .select('id_question, question, aciertos')
                .eq('aciertos', maxAciertos);
            // .eq('aciertos', supabase.rpc('max', { column: 'aciertos' }));

            if (maxAciertosDataError) {
                console.error('Error al obtener preguntas con más aciertos:', maxAciertosDataError);
                return;
            }

            // Obtener preguntas con el mayor número de equivocaciones
            const { data: maxEquivocacionesData, error: maxEquivocacionesDataError } = await supabase
                .from('QuestionsTable')
                .select('id_question, question, equivocaciones')
                .eq('equivocaciones', maxEquivocaciones);
            // .eq('equivocaciones', supabase.rpc('max', { column: 'equivocaciones' }));

            if (maxEquivocacionesDataError) {
                console.error('Error al obtener preguntas con más equivocaciones:', maxEquivocacionesDataError);
                return;
            }

            setTopCorrect(maxAciertosData)
            setTopMistakes(maxEquivocacionesData)

            /////////////////////////////////
            // console.log(topCorrect)
            // console.log(topMistakes)
            /////////////////////////////////

        } catch (error) {
            console.error('Error al obtener las preguntas:', error);
            return;
        }
    };

    // Fetch total desafíos
    const fetchTotalDesafios = async () => {
        try {
            const { data, error, count } = await supabase
                .from('QuestionsTable')
                .select('*', { count: 'exact' });

            if (error) {
                console.error('Error al obtener el total de desafíos:', error.message);
                return;
            }

            setTotalDesafios(count || 0); // Establecemos el total usando el conteo
        } catch (error) {
            console.error('Error inesperado al obtener el total de desafíos:', error);
        }
    };

    // Fetch desafíos por nivel
    const fetchDesafiosPorNivel = async () => {
        try {
            const { data, error } = await supabase
                .from('QuestionsTable')
                .select('id_question, level'); // Obtenemos los niveles y sus IDs

            if (error) {
                console.error('Error al obtener los desafíos por nivel:', error.message);
                return;
            }

            if (data) {
                // Agrupamos los desafíos por nivel
                const grouped = data.reduce((acc: { [key: number]: number }, item) => {
                    const level = item.level;
                    acc[level] = (acc[level] || 0) + 1;
                    return acc;
                }, {});

                // Convertimos el objeto agrupado en un array para facilitar el renderizado
                const groupedArray = Object.entries(grouped).map(([level, total]) => ({
                    level: parseInt(level, 10),
                    total,
                }));

                setDesafiosPorNivel(groupedArray);
            }
        } catch (error) {
            console.error('Error inesperado al obtener los desafíos por nivel:', error);
        }
    };


    const fetchTotalUsuarios = async () => {
        try {
            const { data, error, count } = await supabase
                .from('usuario')
                .select('*', { count: 'exact' });

            if (error) {
                console.error('Error al obtener el total de usuarios:', error.message);
                return;
            }

            setTotalUsuarios(count || 0); // Establecemos el total usando el conteo
        } catch (error) {
            console.error('Error inesperado al obtener el total de usuarios:', error);
        }
    };



    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Administrador')}
                // handleSaveUsername
                >
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity>

                <Text style={styles.header}>Preguntas con más aciertos</Text>

                {topCorrect.map((question, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.question}>
                            {question.question} (Aciertos: {question.aciertos})
                        </Text>
                    </View>
                ))}

                <Text style={styles.header}>Preguntas con más equivocaciones</Text>
                {topMistakes.map((question, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.question}>
                            {question.question} (Equivocaciones: {question.equivocaciones})
                        </Text>
                    </View>
                ))}

                <Text style={styles.title}>Reporte de Usuarios</Text>

                <Text style={styles.text}>
                    Total de usuarios: {totalUsuarios !== null ? totalUsuarios : 'Cargando...'}
                </Text>

                {/* asdf */}
                <Text style={styles.title}>Reporte de Desafíos</Text>

                <Text style={styles.text}>
                    Total de desafíos: {totalDesafios !== null ? totalDesafios : 'Cargando...'}
                </Text>
                {/* asdf */}


                <Text style={styles.subtitle}>Desafíos por Nivel:</Text>
                {desafiosPorNivel.length > 0 ? (
                    desafiosPorNivel.map(({ level, total }) => (
                        <Text key={level} style={styles.text}>
                            Nivel {level}: {total} desafíos
                        </Text>
                    ))
                ) : (
                    <Text style={styles.text}>Cargando...</Text>
                )}
                <Text style={styles.subtitle}></Text>


                {/* asdf */}

            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        top: 40,
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f2f4f7',
        padding: 20,
        bottom: 80,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#f2f4f7',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        padding: 20,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        width: '90%',
        alignItems: "center",
    },
    question: {
        fontSize: 18,
        color: '#2c3e50',
        fontWeight: '500',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2c3e50',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 10,
        color: '#7f8c8d',
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
        marginBottom: 20,
        color: '#34495e',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#1abc9c',
        borderRadius: 8,
        marginRight: 10,
        width: '45%',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
