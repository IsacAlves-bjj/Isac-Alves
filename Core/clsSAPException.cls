VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPException"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPException
' Representa um erro padronizado ocorrido dentro do FrameworkX.
' Toda falha de scripting SAP deve ser convertida para este
' objeto antes de subir para o código do usuário. Nenhuma
' classe do Core deve deixar um erro "cru" do VBA escapar.
'==========================================================

Private pNumber As Long
Private pDescription As String
Private pSource As String
Private pClassName As String
Private pMethodName As String
Private pFieldId As String
Private pTimestamp As Date
Private pIsCritical As Boolean

Public Property Get Number() As Long
    Number = pNumber
End Property

Public Property Get Description() As String
    Description = pDescription
End Property

Public Property Get Source() As String
    Source = pSource
End Property

Public Property Get ClassName() As String
    ClassName = pClassName
End Property

Public Property Get MethodName() As String
    MethodName = pMethodName
End Property

Public Property Get FieldId() As String
    FieldId = pFieldId
End Property

Public Property Get Timestamp() As Date
    Timestamp = pTimestamp
End Property

Public Property Get IsCritical() As Boolean
    IsCritical = pIsCritical
End Property

' Inicializa a excecao com o contexto completo do erro.
' Deve ser chamado sempre a partir de um bloco "On Error".
Public Sub Init(ByVal Number As Long, _
                 ByVal Description As String, _
                 ByVal ClassName As String, _
                 ByVal MethodName As String, _
                 Optional ByVal Source As String = "FrameworkX", _
                 Optional ByVal FieldId As String = "", _
                 Optional ByVal IsCritical As Boolean = False)

    pNumber = Number
    pDescription = Description
    pClassName = ClassName
    pMethodName = MethodName
    pSource = Source
    pFieldId = FieldId
    pTimestamp = Now
    pIsCritical = IsCritical

End Sub

' Formata a excecao para exibicao em log/imediato/msgbox.
Public Function ToString() As String

    Dim sMsg As String
    sMsg = "[FrameworkX] Erro " & pNumber & " em " & pClassName & "." & pMethodName
    If Len(pFieldId) > 0 Then
        sMsg = sMsg & " (campo: " & pFieldId & ")"
    End If
    sMsg = sMsg & vbCrLf & pDescription
    sMsg = sMsg & vbCrLf & "Ocorrido em: " & Format(pTimestamp, "dd/mm/yyyy hh:nn:ss")

    ToString = sMsg

End Function

' Dispara a excecao como erro nativo do VBA, preservando o contexto.
' Use quando o chamador precisar de um "throw" tradicional.
Public Sub Raise()
    Err.Raise vbObjectError + 5000 + pNumber, pSource, Me.ToString()
End Sub
